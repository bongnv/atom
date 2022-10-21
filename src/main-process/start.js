const { app } = require('electron');
const nslog = require('nslog');
const parseCommandLine = require('./parse-command-line');
const getReleaseChannel = require('../shared/get-release-channel');
const atomPaths = require('./atom-paths');
const StartupTime = require('../shared/startup-time');

module.exports = function start(startTime) {
  global.shellStartTime = startTime;
  StartupTime.addMarker('main-process:start');

  process.on('uncaughtException', function (error = {}) {
    if (error.message != null) {
      console.log(error.message);
    }

    if (error.stack != null) {
      console.log(error.stack);
    }
  });

  process.on('unhandledRejection', function (error = {}) {
    if (error.message != null) {
      console.log(error.message);
    }

    if (error.stack != null) {
      console.log(error.stack);
    }
  });

  // TodoElectronIssue this should be set to true before Electron 12 - https://github.com/electron/electron/issues/18397
  app.allowRendererProcessReuse = false;

  app.commandLine.appendSwitch('enable-experimental-web-platform-features');

  const args = parseCommandLine(process.argv.slice(1));

  // This must happen after parseCommandLine() because yargs uses console.log
  // to display the usage message.
  console.log = nslog;

  atomPaths.setAtomHome(app.getPath('home'));
  atomPaths.setUserData(app);

  if (require('electron-squirrel-startup')) return;

  const releaseChannel = getReleaseChannel(app.getVersion());
  let appUserModelId = 'com.squirrel.atom.' + process.arch;

  // If the release channel is not stable, we append it to the app user model id.
  // This allows having the different release channels as separate items in the taskbar.
  if (releaseChannel !== 'stable') {
    appUserModelId += `-${releaseChannel}`;
  }

  // NB: This prevents Win10 from showing dupe items in the taskbar.
  app.setAppUserModelId(appUserModelId);

  function addPathToOpen(event, pathToOpen) {
    event.preventDefault();
    args.pathsToOpen.push(pathToOpen);
  }

  function addUrlToOpen(event, urlToOpen) {
    event.preventDefault();
    args.urlsToOpen.push(urlToOpen);
  }

  app.on('open-file', addPathToOpen);
  app.on('open-url', addUrlToOpen);

  if (args.userDataDir != null) {
    app.setPath('userData', args.userDataDir);
  }

  StartupTime.addMarker('main-process:electron-onready:start');
  app.on('ready', function () {
    StartupTime.addMarker('main-process:electron-onready:end');
    app.removeListener('open-file', addPathToOpen);
    app.removeListener('open-url', addUrlToOpen);
    const AtomApplication = require('./atom-application');
    AtomApplication.open(args);
  });
};
