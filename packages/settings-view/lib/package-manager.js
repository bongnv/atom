/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let PackageManager;
const _ = require('underscore-plus');
const { BufferedProcess, CompositeDisposable, Emitter } = require('atom');
const semver = require('semver');

module.exports = PackageManager = (function () {
  PackageManager = class PackageManager {
    static initClass() {
      // Millisecond expiry for cached loadOutdated, etc. values
      this.prototype.CACHE_EXPIRY = 1000 * 60 * 10;
    }

    constructor() {
      this.packagePromises = [];
      this.emitter = new Emitter();
    }

    isPackageInstalled(packageName) {
      if (atom.packages.isPackageLoaded(packageName)) {
        return true;
      } else {
        return (
          atom.packages.getInstalledPackages().map(p => p.name).indexOf(packageName) > -1
        );
      }
    }

    packageHasSettings(packageName) {
      let left;
      const grammars = (left = atom.grammars.getGrammars()) != null ? left : [];
      for (let grammar of Array.from(grammars)) {
        if (grammar.path) {
          if (grammar.packageName === packageName) {
            return true;
          }
        }
      }

      const pack = atom.packages.getLoadedPackage(packageName);
      if (pack != null && !atom.packages.isPackageActive(packageName)) {
        pack.activateConfig();
      }
      const schema = atom.config.getSchema(packageName);
      return schema != null && schema.type !== 'any';
    }

    // FIXME: bongnv - implement a different approach to load packages
    // find a way to differentiate core and installed
    loadInstalled(callback) {
      const packages = atom.packages.getInstalledPackages();
      const installedPackages = {
        core: [],
        dev: [],
        user: [],
        deprecated: [],
        git: [],
      };
      packages.forEach((pack) => {
        const metadata = atom.packages.loadPackageMetadata(pack);
        if (pack.isBundled) {
          installedPackages.core.push(metadata);
        } else {
          installedPackages.user.push(metadata);
        }
      });
      return callback(null, installedPackages);
    }

    getVersionPinnedPackages() {
      let left;
      return (left = atom.config.get('core.versionPinnedPackages')) != null
        ? left
        : [];
    }

    loadPackage(packageName, callback) {
      const args = ['view', packageName, '--json'];
      const errorMessage = `Fetching package '${packageName}' failed.`;
      // TODO: bongnv - find a way to load packages
      return callback(null, []);
    }

    loadCompatiblePackageVersion(packageName, callback) {
      const args = [
        'view',
        packageName,
        '--json',
        '--compatible',
        this.normalizeVersion(atom.getVersion()),
      ];
      const errorMessage = `Fetching package '${packageName}' failed.`;
      // TODO: bongnv - find a way to load compatible packages
      return callback(null, []);
    }

    getInstalled() {
      return new Promise((resolve, reject) => {
        return this.loadInstalled(function (error, result) {
          if (error) {
            return reject(error);
          } else {
            return resolve(result);
          }
        });
      });
    }

    getPackage(packageName) {
      return this.packagePromises[packageName] != null
        ? this.packagePromises[packageName]
        : (this.packagePromises[packageName] = new Promise(
            (resolve, reject) => {
              return this.loadPackage(packageName, function (error, result) {
                if (error) {
                  return reject(error);
                } else {
                  return resolve(result);
                }
              });
            }
          ));
    }

    satisfiesVersion(version, metadata) {
      const engine =
        metadata.engines?.atom != null ? metadata.engines?.atom : '*';
      if (!semver.validRange(engine)) {
        return false;
      }
      return semver.satisfies(version, engine);
    }

    normalizeVersion(version) {
      if (typeof version === 'string') {
        [version] = version.split('-');
      }
      return version;
    }

    unload(name) {
      if (atom.packages.isPackageLoaded(name)) {
        if (atom.packages.isPackageActive(name)) {
          atom.packages.deactivatePackage(name);
        }
        return atom.packages.unloadPackage(name);
      }
    }

    installAlternative(pack, alternativePackageName, callback) {
      const eventArg = { pack, alternative: alternativePackageName };
      this.emitter.emit('package-installing-alternative', eventArg);

      const uninstallPromise = new Promise((resolve, reject) => {
        return this.uninstall(pack, function (error) {
          if (error) {
            return reject(error);
          } else {
            return resolve();
          }
        });
      });

      const installPromise = new Promise((resolve, reject) => {
        return this.install({ name: alternativePackageName }, function (error) {
          if (error) {
            return reject(error);
          } else {
            return resolve();
          }
        });
      });

      return Promise.all([uninstallPromise, installPromise])
        .then(() => {
          callback(null, eventArg);
          return this.emitter.emit('package-installed-alternative', eventArg);
        })
        .catch((error) => {
          console.error(error.message, error.stack);
          callback(error, eventArg);
          eventArg.error = error;
          return this.emitter.emit(
            'package-install-alternative-failed',
            eventArg
          );
        });
    }

    getPackageTitle({ name }) {
      return _.undasherize(_.uncamelcase(name));
    }

    getRepositoryUrl({ metadata }) {
      let left;
      const { repository } = metadata;
      let repoUrl =
        (left = repository?.url != null ? repository?.url : repository) != null
          ? left
          : '';
      if (repoUrl.match('git@github')) {
        const repoName = repoUrl.split(':')[1];
        repoUrl = `https://github.com/${repoName}`;
      }
      return repoUrl
        .replace(/\.git$/, '')
        .replace(/\/+$/, '')
        .replace(/^git\+/, '');
    }

    getRepositoryBugUri({ metadata }) {
      let bugUri;
      const { bugs } = metadata;
      if (typeof bugs === 'string') {
        bugUri = bugs;
      } else {
        let left;
        bugUri =
          (left = bugs?.url != null ? bugs?.url : bugs?.email) != null
            ? left
            : this.getRepositoryUrl({ metadata }) + '/issues/new';
        if (bugUri.includes('@')) {
          bugUri = 'mailto:' + bugUri;
        }
      }
      return bugUri;
    }

    checkNativeBuildTools() {
      return new Promise((resolve, reject) => {
        // TODO: bongnv - improve this
        return resolve();
      });
    }

    removePackageNameFromDisabledPackages(packageName) {
      return atom.config.removeAtKeyPath('core.disabledPackages', packageName);
    }

    on(selectors, callback) {
      const subscriptions = new CompositeDisposable();
      for (let selector of Array.from(selectors.split(' '))) {
        subscriptions.add(this.emitter.on(selector, callback));
      }
      return subscriptions;
    }
  };
  PackageManager.initClass();
  return PackageManager;
})();
