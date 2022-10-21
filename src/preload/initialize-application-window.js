const AtomEnvironment = require('./atom-environment');
const ApplicationDelegate = require('./application-delegate');
const Clipboard = require('./clipboard');
const TextEditor = require('./text-editor');

const clipboard = new Clipboard();
TextEditor.setClipboard(clipboard);
TextEditor.viewForItem = item => atom.views.getView(item);

global.atom = new AtomEnvironment({
  clipboard,
  applicationDelegate: new ApplicationDelegate(),
  enablePersistence: true
});

TextEditor.setScheduler(global.atom.views);

// Like sands through the hourglass, so are the days of our lives.
module.exports = function({ blobStore }) {
  const { updateProcessEnv } = require('./update-process-env');
  const path = require('path');
  require('./window');
  const getWindowLoadSettings = require('./get-window-load-settings');
  const { ipcRenderer } = require('electron');
  const { devMode } = getWindowLoadSettings();
  require('./electron-shims');

  // Make React faster
  if (!devMode && process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'production';
  }

  global.atom.initialize({
    window,
    document,
    blobStore,
    configDirPath: process.env.ATOM_HOME,
    env: process.env
  });

  return global.atom.startEditorWindow().then(function() {
    // Workaround for focus getting cleared upon window creation
    const windowFocused = function() {
      window.removeEventListener('focus', windowFocused);
      setTimeout(() => document.querySelector('atom-workspace').focus(), 0);
    };
    window.addEventListener('focus', windowFocused);

    ipcRenderer.on('environment', (event, env) => updateProcessEnv(env));
  });
};
