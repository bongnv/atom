const startTime = Date.now();
const electron = require('electron');
const startupMarkers = electron.remote.getCurrentWindow().startupMarkers;
const StartupTime = require('../shared/startup-time');

if (startupMarkers) {
  StartupTime.importData(startupMarkers);
} else {
  StartupTime.setStartTime();
}
StartupTime.addMarker('window:start', Date.now());

require('../install-global-atom');
require('./electron-shims');

const getWindowLoadSettings = require('./get-window-load-settings');

function setLoadTime() {
  if (global.atom) {
    global.atom.loadTime = Date.now() - startTime;
  }
}

function handleSetupError(error) {
  const currentWindow = electron.remote.getCurrentWindow();
  currentWindow.setSize(800, 600);
  currentWindow.center();
  currentWindow.show();
  currentWindow.openDevTools();
  console.error(error.stack || error);
}

process.on('unhandledRejection', function (error, promise) {
  console.error(
    'Unhandled promise rejection %o with error: %o',
    promise,
    error
  );
});

function initializeAtomEnv() {
  const AtomEnvironment = require('./atom-environment');
  const ApplicationDelegate = require('./application-delegate');
  const Clipboard = require('./clipboard');
  const TextEditor = require('./text-editor');

  const clipboard = new Clipboard();
  TextEditor.setClipboard(clipboard);
  TextEditor.viewForItem = (item) => atom.views.getView(item);

  const atom = new AtomEnvironment({
    clipboard,
    applicationDelegate: new ApplicationDelegate(),
  });

  global.atom = atom;

  return atom.initialize({
    window,
    document,
    configDirPath: process.env.ATOM_HOME,
    env: process.env,
  });
}

global.atomAPI = {
  handleSetupError,
  setLoadTime,
  initializeAtomEnv,
  addTimeMarker: (label) => StartupTime.addMarker(label),
  config: () => ({
    profileStartup: getWindowLoadSettings().profileStartup,
  }),
  sendWindowCommand: (command) =>
    electron.ipcRenderer.send('window-command', command),
  getViews: () => global.atom.views,
  startEditorWindow: () => global.atom.startEditorWindow(),
};
