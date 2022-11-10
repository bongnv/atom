import { ipcRenderer } from 'electron';
import * as Remote from '@electron/remote';
import etch from 'etch';

import StartupTime from '../shared/startup-time';
import '../install-global-atom';
import { renderApp } from './app';
import AtomEnvironment from './atom-environment';
import ApplicationDelegate from './application-delegate';
import Clipboard from './clipboard';
import TextEditor from './text-editor';

const initializeAtom = async () => {
  const clipboard = new Clipboard();
  TextEditor.setClipboard(clipboard);

  const atom = new AtomEnvironment({
    clipboard,
    applicationDelegate: new ApplicationDelegate(),
    nodeAPI: window.nodeAPI,
  });

  window.atom = atom;
  etch.setScheduler(atom.views);

  atom.initialize({
    window,
    document,
    configDirPath: process.env.ATOM_HOME,
    env: process.env,
  });

  await renderApp(atom.workspace);
  await atom.startEditorWindow();

  ipcRenderer.send('window-command', 'window:loaded');
  return atom;
};

const start = async () => {
  const startTime = Date.now();
  const startupMarkers = Remote.getCurrentWindow().startupMarkers;

  if (startupMarkers) {
    StartupTime.importData(startupMarkers);
  } else {
    StartupTime.setStartTime();
  }
  StartupTime.addMarker('window:start');

  StartupTime.addMarker('window:initialize:start');
  const atom = await initializeAtom();
  atom.loadTime = Date.now() - startTime;
  StartupTime.addMarker('window:initialize:end');
};

start();
