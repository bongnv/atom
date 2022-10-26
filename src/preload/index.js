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
const initializePreload = require('./initialize-application-window');

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

global.atomAPI = {
  handleSetupError,
  setLoadTime,
  initializePreload,
  addTimeMarker: (label) => StartupTime.addMarker(label),
  config: () => ({
    profileStartup: getWindowLoadSettings().profileStartup,
  }),
  sendWindowCommand: (command) =>
    electron.ipcRenderer.send('window-command', command),
  getViews: () => global.atom.views,
};
