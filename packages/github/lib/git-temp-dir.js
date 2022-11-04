import os from 'os';
import url from 'url';
import path from 'path';
import fs from 'fs-extra';
import { getPackageRoot, getTempDir } from './helpers';

export const BIN_SCRIPTS = {
  getCredentialHelperJs: url.fileURLToPath(
    require('../bin/git-credential-atom.js?raw')
  ),
  getCredentialHelperSh: url.fileURLToPath(
    require('../bin/git-credential-atom.sh?raw')
  ),
  getAskPassJs: url.fileURLToPath(require('../bin/git-askpass-atom.js?raw')),
  getAskPassSh: url.fileURLToPath(require('../bin/git-askpass-atom.sh?raw')),
  getSshWrapperSh: url.fileURLToPath(
    require('../bin/linux-ssh-wrapper.sh?raw')
  ),
  getGpgWrapperSh: url.fileURLToPath(require('../bin/gpg-wrapper.sh?raw')),
};

export default class GitTempDir {
  constructor() {
    this.created = false;
  }

  async ensure() {
    if (this.created) {
      return;
    }

    this.root = await getTempDir({
      dir: process.platform === 'win32' ? os.tmpdir() : '/tmp',
      prefix: 'github-',
      symlinkOk: true,
    });

    await Promise.all(
      Object.values(BIN_SCRIPTS).map(async (filename) => {
        await fs.copy(filename, path.join(this.root, filename));

        if (path.extname(filename) === '.sh') {
          await fs.chmod(path.join(this.root, filename), 0o700);
        }
      })
    );

    this.created = true;
  }

  getRootPath() {
    return this.root;
  }

  getScriptPath(filename) {
    if (!this.created) {
      throw new Error(
        `Attempt to access filename ${filename} in uninitialized GitTempDir`
      );
    }

    return path.join(this.root, filename);
  }

  getSocketOptions() {
    if (process.platform === 'win32') {
      return { port: 0, host: 'localhost' };
    } else {
      return { path: this.getScriptPath('helper.sock') };
    }
  }

  dispose() {
    return fs.remove(this.root);
  }
}

function createGetter(key) {
  const filename = BIN_SCRIPTS[key];
  return function () {
    return this.getScriptPath(filename);
  };
}

for (const key in BIN_SCRIPTS) {
  GitTempDir.prototype[key] = createGetter(key);
}
