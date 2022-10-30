const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');
const os = require('os');

global.nodeAPI = {
  fs: {
    stat: fs.stat,
    isFile: async (filePath) => {
      try {
        const fileStat = await fs.lstat(filePath);
        return fileStat.isFile();
      } catch (err) {
        if (err.code === 'ENOENT') {
          return false;
        }
        throw err;
      }
    },
  },
  crypto: {
    createHash: crypto.createHash,
  },
  path: {
    join: path.join,
  },
  userHomeDir: os.homedir(),
};
