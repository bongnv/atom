const { Disposable } = require('event-kit');
let ipcMain = null;
let BrowserWindow = null;

exports.on = function (emitter, eventName, callback) {
  emitter.on(eventName, callback);
  return new Disposable(() => emitter.removeListener(eventName, callback));
};

exports.respondTo = function (channel, callback) {
  if (!ipcMain) {
    const electron = require('electron');
    ipcMain = electron.ipcMain;
    BrowserWindow = electron.BrowserWindow;
  }

  return exports.on(
    ipcMain,
    channel,
    async (event, responseChannel, ...args) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      const result = await callback(browserWindow, ...args);
      if (!event.sender.isDestroyed()) {
        event.sender.send(responseChannel, result);
      }
    }
  );
};
