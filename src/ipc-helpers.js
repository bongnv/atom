const Disposable = require('event-kit').Disposable;
let ipcRenderer = null;

let nextResponseChannelId = 0;

exports.on = function(emitter, eventName, callback) {
  emitter.on(eventName, callback);
  return new Disposable(() => emitter.removeListener(eventName, callback));
};

exports.call = function(channel, ...args) {
  if (!ipcRenderer) {
    ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.setMaxListeners(20);
  }

  const responseChannel = `ipc-helpers-response-${nextResponseChannelId++}`;

  return new Promise(resolve => {
    ipcRenderer.on(responseChannel, (event, result) => {
      ipcRenderer.removeAllListeners(responseChannel);
      resolve(result);
    });

    ipcRenderer.send(channel, responseChannel, ...args);
  });
};
