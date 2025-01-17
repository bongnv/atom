// bongnv: this file should be under main-process

const _ = require('underscore-plus');
const fs = require('fs');
const dedent = require('dedent');
const { Disposable, Emitter } = require('event-kit');
const { watchPath } = require('../shared/path-watcher');
const Path = require('path');
const asyncQueue = require('async/queue');

const EVENT_TYPES = new Set(['created', 'modified', 'renamed']);

module.exports = class ConfigFile {
  static at(path) {
    if (!this._known) {
      this._known = new Map();
    }

    const existing = this._known.get(path);
    if (existing) {
      return existing;
    }

    const created = new ConfigFile(path);
    this._known.set(path, created);
    return created;
  }

  constructor(path) {
    this.path = path;
    this.emitter = new Emitter();
    this.value = {};
    this.reloadCallbacks = [];

    // Use a queue to prevent multiple concurrent write to the same file.
    const writeQueue = asyncQueue((data, callback) =>
      fs.writeFile(this.path, JSON.stringify(data), (error) => {
        if (error) {
          this.emitter.emit(
            'did-error',
            dedent`
              Failed to write \`${Path.basename(this.path)}\`.

              ${error.message}
            `
          );
        }
        callback();
      })
    );

    this.requestLoad = _.debounce(() => this.reload(), 200);
    this.requestSave = _.debounce((data) => writeQueue.push(data), 200);
  }

  get() {
    return this.value;
  }

  update(value) {
    return new Promise((resolve) => {
      this.requestSave(value);
      this.reloadCallbacks.push(resolve);
    });
  }

  async watch() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({}), { flag: 'wx' });
    }

    await this.reload();

    try {
      return await watchPath(this.path, {}, (events) => {
        if (events.some((event) => EVENT_TYPES.has(event.action)))
          this.requestLoad();
      });
    } catch (error) {
      this.emitter.emit(
        'did-error',
        dedent`
        Unable to watch path: \`${Path.basename(this.path)}\`.

        Make sure you have permissions to \`${this.path}\`.
        On linux there are currently problems with watch sizes.
        See [this document][watches] for more info.

        [watches]:https://github.com/atom/atom/blob/master/docs/build-instructions/linux.md#typeerror-unable-to-watch-path\
      `
      );
      return new Disposable();
    }
  }

  onDidChange(callback) {
    return this.emitter.on('did-change', callback);
  }

  onDidError(callback) {
    return this.emitter.on('did-error', callback);
  }

  reload() {
    return new Promise((resolve) => {
      fs.readFile(this.path, (error, data) => {
        if (error) {
          this.emitter.emit(
            'did-error',
            `Failed to load \`${Path.basename(this.path)}\` - ${error.message}`
          );
        } else {
          this.value = JSON.parse(data) || {};
          this.emitter.emit('did-change', this.value);

          for (const callback of this.reloadCallbacks) callback();
          this.reloadCallbacks.length = 0;
        }
        resolve();
      });
    });
  }
};
