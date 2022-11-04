const { promises: fs, constants: fsConstants } = require('fs');
const crypto = require('crypto');
const path = require('path');
const os = require('os');

const userHomeDir = os.homedir();

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
    isDirectory: async (filePath) => {
      try {
        const fileStat = await fs.lstat(filePath);
        return fileStat.isDirectory();
      } catch (err) {
        if (err.code === 'ENOENT') {
          return false;
        }
        throw err;
      }
    },
    resolveName: async (loadPaths, name) => {
      for (const loadPath of loadPaths) {
        const candidatePath = path.join(loadPath, name);
        try {
          await fs.access(candidatePath, fsConstants.F_OK);
          return candidatePath;
        } catch (err) {
          if (err.code === 'ENOENT') {
            continue
          }
          console.warn(`Failed to check ${candidatePath}`, err);
        }
      }

      return undefined;
    },
    tildify: (pathToTildify) => {
      if (process.platform === 'win32') { return pathToTildify; }

      const normalized = path.normalize(pathToTildify);

      if (normalized === userHomeDir) { return '~'; }
      if (!normalized.startsWith(path.join(userHomeDir, path.sep))) { return pathToTildify; }

      return path.join('~', path.sep, normalized.substring(userHomeDir.length + 1));
    },
    open: fs.open,
    getSize: async (filePath) => {
      const stat = await fs.stat(filePath);
      return stat.size || -1;
    },
  },
  crypto: {
    createHash: crypto.createHash,
  },
  path: {
    join: path.join,
    dirname: path.dirname,
    sep: path.sep,
  },
  userHomeDir,
};
