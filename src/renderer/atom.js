const { Emitter, Disposable, CompositeDisposable } = require('event-kit');

const TextBuffer = require('./text-buffer/text-buffer');
const Point = require('./text-buffer/point');
const Range = require('./text-buffer/range');
const Directory = require('./directory');
const File = require('./file');
const BufferedNodeProcess = require('../buffered-node-process');
const BufferedProcess = require('../buffered-process');
const GitRepository = require('./git-repository');
const Notification = require('./notification');
const { watchPath } = require('../shared/path-watcher');
const { ScopeSelector, GrammarRegistry } = require('./first-mate/first-mate');
const Task = require('./task');
const TextEditor = require('./text-editor');

const atomExport = {
  BufferedNodeProcess,
  BufferedProcess,
  GitRepository,
  Notification,
  TextBuffer,
  Point,
  Range,
  File,
  Directory,
  Emitter,
  Disposable,
  CompositeDisposable,
  watchPath,
  ScopeSelector,
  GrammarRegistry,
  Task,
  TextEditor,
};

// Shell integration is required by both Squirrel and Settings-View
if (process.platform === 'win32') {
  Object.defineProperty(atomExport, 'WinShell', {
    enumerable: true,
    get() {
      return require('./win-shell');
    },
  });
}

module.exports = atomExport;
