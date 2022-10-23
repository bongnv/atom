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

const path = require('path');
const getWindowLoadSettings = require('./get-window-load-settings');

function setLoadTime(loadTime) {
  if (global.atom) {
    global.atom.loadTime = loadTime;
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

function setupWindow() {
  const initialize = require('./initialize-application-window');

  StartupTime.addMarker('window:initialize:start');

  const FileSystemBlobStore = require('./file-system-blob-store');
  const blobStore = FileSystemBlobStore.load(
    path.join(process.env.ATOM_HOME, 'blob-store')
  );

  return initialize({ blobStore: blobStore }).then(function () {
    StartupTime.addMarker('window:initialize:end');
    electron.ipcRenderer.send('window-command', 'window:loaded');
  });
}

function openWithDevTools(profile) {
  const webContents = electron.remote.getCurrentWindow().webContents;
  if (webContents.devToolsWebContents) {
    profile();
  } else {
    webContents.once('devtools-opened', () => {
      setTimeout(profile, 1000);
    });
    webContents.openDevTools();
  }
}

process.on('unhandledRejection', function (error, promise) {
  console.error(
    'Unhandled promise rejection %o with error: %o',
    promise,
    error
  );
});

global.atomAPI = {
  setupWindow,
  handleSetupError,
  setLoadTime,
  addTimeMarker: (label) => StartupTime.addMarker(label),
  config: () => ({
    profileStartup: getWindowLoadSettings().profileStartup,
  }),
  openWithDevTools,
};
