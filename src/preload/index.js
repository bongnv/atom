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

function profileStartup(initialTime) {
  function profile() {
    console.profile('startup');
    const startTime = Date.now();
    setupWindow().then(function () {
      setLoadTime(Date.now() - startTime + initialTime);
      console.profileEnd('startup');
      console.log(
        'Switch to the Profiles tab to view the created startup profile'
      );
    });
  }

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

function setupAtomHome() {
  if (process.env.ATOM_HOME) {
    return;
  }

  // Ensure ATOM_HOME is always set before anything else is required
  // This is because of a difference in Linux not inherited between browser and render processes
  // https://github.com/atom/atom/issues/5412
  if (getWindowLoadSettings() && getWindowLoadSettings().atomHome) {
    process.env.ATOM_HOME = getWindowLoadSettings().atomHome;
  }
}

global.atomAPI = {
  load: () => {
    try {
      StartupTime.addMarker('window:onload:start');
      const startTime = Date.now();

      process.on('unhandledRejection', function (error, promise) {
        console.error(
          'Unhandled promise rejection %o with error: %o',
          promise,
          error
        );
      });

      setupAtomHome();

      if (getWindowLoadSettings().profileStartup) {
        profileStartup(Date.now() - startTime);
      } else {
        StartupTime.addMarker('window:setup-window:start');
        setupWindow().then(() => {
          StartupTime.addMarker('window:setup-window:end');
        });
        setLoadTime(Date.now() - startTime);
      }
    } catch (error) {
      handleSetupError(error);
    }
    StartupTime.addMarker('window:onload:end');
  },
};
