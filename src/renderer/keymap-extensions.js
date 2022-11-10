/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const fs = require('fs-plus');
const path = require('path');
const KeymapManager = require('./keymap/keymap-manager');

KeymapManager.prototype.onDidLoadBundledKeymaps = function (callback) {
  return this.emitter.on('did-load-bundled-keymaps', callback);
};

KeymapManager.prototype.onDidLoadUserKeymap = function (callback) {
  return this.emitter.on('did-load-user-keymap', callback);
};

KeymapManager.prototype.canLoadBundledKeymapsFromMemory = () => true;

KeymapManager.prototype.loadBundledKeymaps = function () {
  this.add(
    'core:base',
    require('../../keymaps/base.json'),
    0,
    this.devMode != null ? this.devMode : false
  );
  this.add(
    'core:darwin',
    require('../../keymaps/darwin.json'),
    0,
    this.devMode != null ? this.devMode : false
  );
  this.add(
    'core:linux',
    require('../../keymaps/linux.json'),
    0,
    this.devMode != null ? this.devMode : false
  );
  this.add(
    'core:win32',
    require('../../keymaps/win32.json'),
    0,
    this.devMode != null ? this.devMode : false
  );

  return this.emitter.emit('did-load-bundled-keymaps');
};

KeymapManager.prototype.getUserKeymapPath = function () {
  if (this.configDirPath == null) {
    return '';
  }
  return path.join(this.configDirPath, 'keymap.json');
};

KeymapManager.prototype.loadUserKeymap = function () {
  let message;
  const userKeymapPath = this.getUserKeymapPath();
  if (!fs.isFileSync(userKeymapPath)) {
    return;
  }

  try {
    this.loadKeymap(userKeymapPath, {
      watch: true,
      suppressErrors: true,
      priority: 100,
    });
  } catch (error) {
    if (error.message.indexOf('Unable to watch path') > -1) {
      message = `\
Unable to watch path: \`${path.basename(userKeymapPath)}\`. Make sure you
have permission to read \`${userKeymapPath}\`.

On linux there are currently problems with watch sizes. See
[this document][watches] for more info.
[watches]:https://github.com/atom/atom/blob/master/docs/build-instructions/linux.md#typeerror-unable-to-watch-path\
`;
      this.notificationManager.addError(message, { dismissable: true });
    } else {
      const detail = error.path;
      const { stack } = error;
      this.notificationManager.addFatalError(error.message, {
        detail,
        stack,
        dismissable: true,
      });
    }
  }

  return this.emitter.emit('did-load-user-keymap');
};

KeymapManager.prototype.subscribeToFileReadFailure = function () {
  return this.onDidFailToReadFile((error) => {
    const userKeymapPath = this.getUserKeymapPath();
    const message = `Failed to load \`${userKeymapPath}\``;

    const detail = error.location != null ? error.stack : error.message;

    return this.notificationManager.addError(message, {
      detail,
      dismissable: true,
    });
  });
};

module.exports = KeymapManager;
