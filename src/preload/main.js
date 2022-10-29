const fs = require('fs').promises;

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
};
