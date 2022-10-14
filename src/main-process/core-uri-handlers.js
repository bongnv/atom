const fs = require('fs');

function windowShouldOpenFile({ query }) {
  const { filename } = query;
  const stat = fs.statSyncNoException(filename);

  return win =>
    win.containsLocation({
      pathToOpen: filename,
      exists: Boolean(stat),
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory()
    });
}

const ROUTER = {
  '/open/file': { getWindowPredicate: windowShouldOpenFile }
};

module.exports = {
  windowPredicate(parsed) {
    const config = ROUTER[parsed.pathname];
    if (config && config.getWindowPredicate) {
      return config.getWindowPredicate(parsed);
    } else {
      return () => true;
    }
  }
};
