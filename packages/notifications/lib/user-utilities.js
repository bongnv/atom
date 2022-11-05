/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { BufferedProcess } = require('atom');

/*
A collection of methods for retrieving information about the user's system for
bug report purposes.
*/

const DEV_PACKAGE_PATH = path.join('dev', 'packages');

module.exports = {
  /*
  Section: System Information
  */

  getPlatform() {
    return os.platform();
  },

  // OS version strings lifted from https://github.com/lee-dohm/bug-report
  getOSVersion() {
    return new Promise((resolve, reject) => {
      switch (this.getPlatform()) {
        case 'darwin':
          return resolve(this.macVersionText());
        case 'win32':
          return resolve(this.winVersionText());
        case 'linux':
          return resolve(this.linuxVersionText());
        default:
          return resolve(`${os.platform()} ${os.release()}`);
      }
    });
  },

  macVersionText() {
    return this.macVersionInfo().then(function (info) {
      if (!info.ProductName || !info.ProductVersion) {
        return 'Unknown macOS version';
      }
      return `${info.ProductName} ${info.ProductVersion}`;
    });
  },

  macVersionInfo() {
    return new Promise(function (resolve, reject) {
      let stdout = '';
      const plistBuddy = new BufferedProcess({
        command: '/usr/libexec/PlistBuddy',
        args: [
          '-c',
          'Print ProductVersion',
          '-c',
          'Print ProductName',
          '/System/Library/CoreServices/SystemVersion.plist',
        ],
        stdout(output) {
          return (stdout += output);
        },
        exit() {
          const [ProductVersion, ProductName] = Array.from(
            stdout.trim().split('\n')
          );
          return resolve({ ProductVersion, ProductName });
        },
      });

      return plistBuddy.onWillThrowError(function ({ handle }) {
        handle();
        return resolve({});
      });
    });
  },

  linuxVersionText() {
    return this.linuxVersionInfo().then(function (info) {
      if (info.DistroName && info.DistroVersion) {
        return `${info.DistroName} ${info.DistroVersion}`;
      } else {
        return `${os.platform()} ${os.release()}`;
      }
    });
  },

  linuxVersionInfo() {
    return new Promise(function (resolve, reject) {
      let stdout = '';

      const lsbRelease = new BufferedProcess({
        command: 'lsb_release',
        args: ['-ds'],
        stdout(output) {
          return (stdout += output);
        },
        exit(exitCode) {
          const [DistroName, DistroVersion] = Array.from(
            stdout.trim().split(' ')
          );
          return resolve({ DistroName, DistroVersion });
        },
      });

      return lsbRelease.onWillThrowError(function ({ handle }) {
        handle();
        return resolve({});
      });
    });
  },

  winVersionText() {
    return new Promise(function (resolve, reject) {
      const data = [];
      const systemInfo = new BufferedProcess({
        command: 'systeminfo',
        stdout(oneLine) {
          return data.push(oneLine);
        },
        exit() {
          let res;
          let info = data.join('\n');
          info = (res = /OS.Name.\s+(.*)$/im.exec(info))
            ? res[1]
            : 'Unknown Windows version';
          return resolve(info);
        },
      });

      return systemInfo.onWillThrowError(function ({ handle }) {
        handle();
        return resolve('Unknown Windows version');
      });
    });
  },

  /*
  Section: Installed Packages
  */

  getNonCorePackages() {
    return new Promise(function (resolve, reject) {
      const nonCorePackages = atom.packages
        .getInstalledPackages()
        .filter((p) => !p.isBundled)
        .map((p) => atom.packages.loadPackageMetadata(p));
      const devPackageNames = [];
      return resolve(
        nonCorePackages.map(
          (pack) =>
            `${pack.name} ${pack.version} ${
              devPackageNames.includes(pack.name) ? '(dev)' : ''
            }`
        )
      );
    });
  },

  getLatestAtomData() {
    const githubHeaders = new Headers({
      accept: 'application/vnd.github.v3+json',
      contentType: 'application/json',
    });
    return fetch('https://atom.io/api/updates', {
      headers: githubHeaders,
    }).then(function (r) {
      if (r.ok) {
        return r.json();
      } else {
        return Promise.reject(r.statusCode);
      }
    });
  },

  checkAtomUpToDate() {
    return this.getLatestAtomData().then(function (latestAtomData) {
      const installedVersion = __guard__(atom.getVersion(), (x) =>
        x.replace(/-.*$/, '')
      );
      const latestVersion = latestAtomData.name;
      const upToDate =
        installedVersion != null && semver.gte(installedVersion, latestVersion);
      return { upToDate, latestVersion, installedVersion };
    });
  },
};

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
