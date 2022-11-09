const startTime = Date.now();
const electron = require('electron');
const remote = require('@electron/remote');
const startupMarkers = remote.getCurrentWindow().startupMarkers;
const StartupTime = require('../shared/startup-time');

if (startupMarkers) {
  StartupTime.importData(startupMarkers);
} else {
  StartupTime.setStartTime();
}
StartupTime.addMarker('window:start');

require('../install-global-atom');
require('./window');

function handleSetupError(error) {
  const currentWindow = remote.getCurrentWindow();
  currentWindow.setSize(800, 600);
  currentWindow.center();
  currentWindow.show();
  currentWindow.openDevTools();
  console.error(error.stack || error);
}

process.on('unhandledRejection', (error, promise) => {
  console.error(
    'Unhandled promise rejection %o with error: %o',
    promise,
    error
  );
});

const initializeWindow = async () => {
  const AtomEnvironment = require('./atom-environment');
  const ApplicationDelegate = require('./application-delegate');
  const Clipboard = require('./clipboard');
  const TextEditor = require('./text-editor');

  const clipboard = new Clipboard();
  TextEditor.setClipboard(clipboard);

  const atom = new AtomEnvironment({
    clipboard,
    applicationDelegate: new ApplicationDelegate(),
    nodeAPI: window.nodeAPI,
  });

  global.atom = atom;
  require('etch').setScheduler(atom.views);

  atom.initialize({
    window,
    document,
    configDirPath: process.env.ATOM_HOME,
    env: process.env,
  });

  const React = require('react');
  const ReactDom = require('react-dom');
  const { WorkspaceView } = require('./components/workspace-view');
  await new Promise((resolve) => {
    ReactDom.render(
      <WorkspaceView
        onReady={(workspaceElement) => {
          atom.workspace.element = workspaceElement;
          workspaceElement.initialize(atom.workspace, {
            config: atom.workspace.config,
            project: atom.workspace.project,
            viewRegistry: atom.workspace.viewRegistry,
            styleManager: atom.workspace.styleManager,
          });
          resolve();
        }}
      />,
      document.body
    );
  });
  await atom.startEditorWindow();
  electron.ipcRenderer.send('window-command', 'window:loaded');
  atom.loadTime = Date.now() - startTime;
};

const start = async () => {
  try {
    const getWindowLoadSettings = require('./get-window-load-settings');
    const profileStartup = getWindowLoadSettings().profileStartup;
    if (profileStartup) {
      console.profile('startup');
    }

    StartupTime.addMarker('window:initialize:start');
    await initializeWindow();
    StartupTime.addMarker('window:initialize:end');

    if (profileStartup) {
      console.profileEnd('startup');
      console.log(
        'Switch to the Profiles tab to view the created startup profile'
      );
    }
  } catch (error) {
    handleSetupError(error);
  }
};

start();
