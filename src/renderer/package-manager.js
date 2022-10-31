const path = require('path');
const _ = require('underscore-plus');
const { Emitter } = require('event-kit');
const fs = require('fs-plus');
const ServiceHub = require('service-hub');

const atomConfig = require('../shared/path-config');
const Package = require('./package');
const ThemePackage = require('./theme-package');
const packageJSON = require('../../package.json');

let normalizePackageData = null;

// Extended: Package manager for coordinating the lifecycle of Atom packages.
//
// An instance of this class is always available as the `atom.packages` global.
//
// Packages can be loaded, activated, and deactivated, and unloaded:
//  * Loading a package reads and parses the package's metadata and resources
//    such as keymaps, menus, stylesheets, etc.
//  * Activating a package registers the loaded resources and calls `activate()`
//    on the package's main module.
//  * Deactivating a package unregisters the package's resources  and calls
//    `deactivate()` on the package's main module.
//  * Unloading a package removes it completely from the package manager.
//
// Packages can be enabled/disabled via the `core.disabledPackages` config
// settings and also by calling `enablePackage()/disablePackage()`.
module.exports = class PackageManager {
  constructor(params) {
    ({
      config: this.config,
      styleManager: this.styleManager,
      notificationManager: this.notificationManager,
      keymapManager: this.keymapManager,
      commandRegistry: this.commandRegistry,
      grammarRegistry: this.grammarRegistry,
      deserializerManager: this.deserializerManager,
      viewRegistry: this.viewRegistry,
      uriHandlerRegistry: this.uriHandlerRegistry,
    } = params);

    this.emitter = new Emitter();
    this.activationHookEmitter = new Emitter();
    this.packageDirPaths = [];
    this.deferredActivationHooks = [];
    this.triggeredActivationHooks = new Set();
    this.bundledPackages = new Set();
    this.initialPackagesLoaded = false;
    this.initialPackagesActivated = false;
    this.loadedPackages = {};
    this.activePackages = {};
    this.activatingPackages = {};
    this.packageStates = {};
    this.serviceHub = new ServiceHub();

    this.packageActivators = [];
    this.registerPackageActivator(this, ['atom', 'textmate']);
  }

  initialize({ configDirPath, devMode } = {}) {
    this.devMode = devMode;
    if (configDirPath != null) {
      this.packageDirPaths.push(path.join(configDirPath, 'packages'));
    }
  }

  setContextMenuManager(contextMenuManager) {
    this.contextMenuManager = contextMenuManager;
  }

  setMenuManager(menuManager) {
    this.menuManager = menuManager;
  }

  setThemeManager(themeManager) {
    this.themeManager = themeManager;
  }

  async reset() {
    this.serviceHub.clear();
    await this.deactivatePackages();
    this.loadedPackages = {};
    this.packageStates = {};
    this.bundledPackage.clear();
    this.triggeredActivationHooks.clear();
    this.activatePromise = null;
  }

  /*
  Section: Event Subscription
  */

  // Public: Invoke the given callback when all packages have been loaded.
  //
  // * `callback` {Function}
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidLoadInitialPackages(callback) {
    return this.emitter.on('did-load-initial-packages', callback);
  }

  // Public: Invoke the given callback when all packages have been activated.
  //
  // * `callback` {Function}
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidActivateInitialPackages(callback) {
    return this.emitter.on('did-activate-initial-packages', callback);
  }

  getActivatePromise() {
    if (this.activatePromise) {
      return this.activatePromise;
    } else {
      return Promise.resolve();
    }
  }

  // Public: Invoke the given callback when a package is activated.
  //
  // * `callback` A {Function} to be invoked when a package is activated.
  //   * `package` The {Package} that was activated.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidActivatePackage(callback) {
    return this.emitter.on('did-activate-package', callback);
  }

  // Public: Invoke the given callback when a package is deactivated.
  //
  // * `callback` A {Function} to be invoked when a package is deactivated.
  //   * `package` The {Package} that was deactivated.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidDeactivatePackage(callback) {
    return this.emitter.on('did-deactivate-package', callback);
  }

  // Public: Invoke the given callback when a package is loaded.
  //
  // * `callback` A {Function} to be invoked when a package is loaded.
  //   * `package` The {Package} that was loaded.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidLoadPackage(callback) {
    return this.emitter.on('did-load-package', callback);
  }

  // Public: Invoke the given callback when a package is unloaded.
  //
  // * `callback` A {Function} to be invoked when a package is unloaded.
  //   * `package` The {Package} that was unloaded.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidUnloadPackage(callback) {
    return this.emitter.on('did-unload-package', callback);
  }

  /*
  Section: Package system data
  */

  // Public: Get the paths being used to look for packages.
  //
  // Returns an {Array} of {String} directory paths.
  getPackageDirPaths() {
    return _.clone(this.packageDirPaths);
  }

  /*
  Section: General package data
  */

  // Public: Resolve the given package name to a path on disk.
  //
  // * `name` - The {String} package name.
  //
  // Return a {String} folder path or undefined if it could not be resolved.
  resolvePackagePath(name) {
    if (fs.isDirectorySync(name)) {
      return name;
    }

    let packagePath = fs.resolve(...this.packageDirPaths, name);
    if (fs.isDirectorySync(packagePath)) {
      return packagePath;
    }

    packagePath = path.join(atomConfig.rootDir, 'packages', name);
    // FIXME: bongnv - should resolve from inmemory packages
    if (this.hasAtomEngine(packagePath)) {
      return packagePath;
    }

    return null;
  }

  // Public: Is the package with the given name bundled with Atom?
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Boolean}.
  isBundledPackage(name) {
    return this.bundledPackages.has(name);
  }

  /*
  Section: Enabling and disabling packages
  */

  // Public: Enable the package with the given name.
  //
  // * `name` - The {String} package name.
  //
  // Returns the {Package} that was enabled or null if it isn't loaded.
  enablePackage(name) {
    const pack = this.loadPackage(name);
    if (pack != null) {
      pack.enable();
    }
    return pack;
  }

  // Public: Disable the package with the given name.
  //
  // * `name` - The {String} package name.
  //
  // Returns the {Package} that was disabled or null if it isn't loaded.
  disablePackage(name) {
    const pack = this.loadPackage(name);
    if (!this.isPackageDisabled(name) && pack != null) {
      pack.disable();
    }
    return pack;
  }

  // Public: Is the package with the given name disabled?
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Boolean}.
  isPackageDisabled(name) {
    return _.include(this.config.get('core.disabledPackages') || [], name);
  }

  /*
  Section: Accessing active packages
  */

  // Public: Get an {Array} of all the active {Package}s.
  getActivePackages() {
    return _.values(this.activePackages);
  }

  // Public: Get the active {Package} with the given name.
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Package} or undefined.
  getActivePackage(name) {
    return this.activePackages[name];
  }

  // Public: Is the {Package} with the given name active?
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Boolean}.
  isPackageActive(name) {
    return this.getActivePackage(name) != null;
  }

  // Public: Returns a {Boolean} indicating whether package activation has occurred.
  hasActivatedInitialPackages() {
    return this.initialPackagesActivated;
  }

  /*
  Section: Accessing loaded packages
  */

  // Public: Get an {Array} of all the loaded {Package}s
  getLoadedPackages() {
    return _.values(this.loadedPackages);
  }

  // Get packages for a certain package type
  //
  // * `types` an {Array} of {String}s like ['atom', 'textmate'].
  getLoadedPackagesForTypes(types) {
    return this.getLoadedPackages().filter((p) => types.includes(p.getType()));
  }

  // Public: Get the loaded {Package} with the given name.
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Package} or undefined.
  getLoadedPackage(name) {
    return this.loadedPackages[name];
  }

  // Public: Is the package with the given name loaded?
  //
  // * `name` - The {String} package name.
  //
  // Returns a {Boolean}.
  isPackageLoaded(name) {
    return this.getLoadedPackage(name) != null;
  }

  // Public: Returns a {Boolean} indicating whether package loading has occurred.
  hasLoadedInitialPackages() {
    return this.initialPackagesLoaded;
  }

  /*
  Section: Accessing available packages
  */

  // Public: Returns an {Array} of {String}s of all the available package paths.
  getAvailablePackagePaths() {
    return this.getAvailablePackages().map((a) => a.path);
  }

  // Public: Returns an {Array} of {String}s of all the available package names.
  getAvailablePackageNames() {
    return this.getAvailablePackages().map((a) => a.name);
  }

  // Public: Returns an {Array} of {String}s of all the available package metadata.
  getAvailablePackageMetadata() {
    const packages = [];
    for (const pack of this.getAvailablePackages()) {
      const loadedPackage = this.getLoadedPackage(pack.name);
      const metadata =
        loadedPackage != null
          ? loadedPackage.metadata
          : this.loadPackageMetadata(pack, true);
      packages.push(metadata);
    }
    return packages;
  }

  getAvailablePackages() {
    const packages = [];
    const packagesByName = new Set();

    for (const packageDirPath of this.packageDirPaths) {
      if (fs.isDirectorySync(packageDirPath)) {
        // checks for directories.
        // dirent is faster, but for checking symbolic link we need stat.
        const packageNames = fs
          .readdirSync(packageDirPath, { withFileTypes: true })
          .filter(
            (dirent) =>
              dirent.isDirectory() ||
              (dirent.isSymbolicLink() &&
                fs.isDirectorySync(path.join(packageDirPath, dirent.name)))
          )
          .map((dirent) => dirent.name);

        for (const packageName of packageNames) {
          if (
            !packageName.startsWith('.') &&
            !packagesByName.has(packageName)
          ) {
            const packagePath = path.join(packageDirPath, packageName);
            packages.push({
              name: packageName,
              path: packagePath,
              isBundled: false,
            });
            packagesByName.add(packageName);
          }
        }
      }
    }

    const packagesContext = require.context(
      '../../packages',
      true,
      /^\.\/[\w\d-]*\/package\.json$/
    );
    packagesContext.keys().forEach((packagePath) => {
      const packageName = packagePath.match(
        /^\.\/([\w\d-]*)\/package\.json$/
      )[1];
      this.bundledPackages.add(packageName);
      if (!packagesByName.has(packageName)) {
        packages.push({
          name: packageName,
          path: path.join(atomConfig.rootDir, 'packages', packageName),
          isBundled: true,
          metadata: packagesContext(packagePath),
        });
        packagesByName.add(packageName);
      }
    });

    return packages.sort((a, b) => a.name.localeCompare(b.name));
  }

  /*
  Section: Private
  */

  getPackageState(name) {
    return this.packageStates[name];
  }

  setPackageState(name, state) {
    this.packageStates[name] = state;
  }

  hasAtomEngine(packagePath) {
    const metadata = this.loadPackageMetadataByPath(packagePath, true);
    return (
      metadata != null &&
      metadata.engines != null &&
      metadata.engines.atom != null
    );
  }

  unobserveDisabledPackages() {
    if (this.disabledPackagesSubscription != null) {
      this.disabledPackagesSubscription.dispose();
    }
    this.disabledPackagesSubscription = null;
  }

  observeDisabledPackages() {
    if (this.disabledPackagesSubscription != null) {
      return;
    }

    this.disabledPackagesSubscription = this.config.onDidChange(
      'core.disabledPackages',
      ({ newValue, oldValue }) => {
        const packagesToEnable = _.difference(oldValue, newValue);
        const packagesToDisable = _.difference(newValue, oldValue);
        packagesToDisable.forEach((name) => {
          if (this.getActivePackage(name)) this.deactivatePackage(name);
        });
        packagesToEnable.forEach((name) => this.activatePackage(name));
        return null;
      }
    );
  }

  unobservePackagesWithKeymapsDisabled() {
    if (this.packagesWithKeymapsDisabledSubscription != null) {
      this.packagesWithKeymapsDisabledSubscription.dispose();
    }
    this.packagesWithKeymapsDisabledSubscription = null;
  }

  observePackagesWithKeymapsDisabled() {
    if (this.packagesWithKeymapsDisabledSubscription != null) {
      return;
    }

    const performOnLoadedActivePackages = (
      packageNames,
      disabledPackageNames,
      action
    ) => {
      for (const packageName of packageNames) {
        if (!disabledPackageNames.has(packageName)) {
          const pack = this.getLoadedPackage(packageName);
          if (pack != null) {
            action(pack);
          }
        }
      }
    };

    this.packagesWithKeymapsDisabledSubscription = this.config.onDidChange(
      'core.packagesWithKeymapsDisabled',
      ({ newValue, oldValue }) => {
        const keymapsToEnable = _.difference(oldValue, newValue);
        const keymapsToDisable = _.difference(newValue, oldValue);

        const disabledPackageNames = new Set(
          this.config.get('core.disabledPackages')
        );
        performOnLoadedActivePackages(
          keymapsToDisable,
          disabledPackageNames,
          (p) => p.deactivateKeymaps()
        );
        performOnLoadedActivePackages(
          keymapsToEnable,
          disabledPackageNames,
          (p) => p.activateKeymaps()
        );
        return null;
      }
    );
  }

  loadPackages() {
    const disabledPackageNames = new Set(
      this.config.get('core.disabledPackages')
    );
    this.config.transact(() => {
      for (const pack of this.getAvailablePackages()) {
        this.loadAvailablePackage(pack, disabledPackageNames);
      }
    });
    this.initialPackagesLoaded = true;
    this.emitter.emit('did-load-initial-packages');
  }

  loadPackage(name) {
    const pack = this.getLoadedPackage(name);
    if (pack) {
      return pack;
    }

    const packagePath = this.resolvePackagePath(name);
    if (packagePath) {
      return this.loadAvailablePackage({
        name,
        path: packagePath,
        isBundled: this.isBundledPackagePath(packagePath),
      });
    }

    console.warn(`Could not resolve '${nameOrPath}' to a package path`);
    return null;
  }

  loadAvailablePackage(availablePackage, disabledPackageNames) {
    if (
      disabledPackageNames != null &&
      disabledPackageNames.has(availablePackage.name)
    ) {
      return null;
    }

    let metadata;
    try {
      metadata = this.loadPackageMetadata(availablePackage) || {};
    } catch (error) {
      this.handleMetadataError(error, availablePackage.path);
      return null;
    }

    const options = {
      path: availablePackage.path,
      name: metadata.name || availablePackage.name,
      metadata,
      bundledPackage: availablePackage.isBundled,
      packageManager: this,
      config: this.config,
      styleManager: this.styleManager,
      commandRegistry: this.commandRegistry,
      keymapManager: this.keymapManager,
      notificationManager: this.notificationManager,
      grammarRegistry: this.grammarRegistry,
      themeManager: this.themeManager,
      menuManager: this.menuManager,
      contextMenuManager: this.contextMenuManager,
      deserializerManager: this.deserializerManager,
      viewRegistry: this.viewRegistry,
    };

    const pack = metadata.theme
      ? new ThemePackage(options)
      : new Package(options);
    pack.load();
    this.loadedPackages[pack.name] = pack;
    this.emitter.emit('did-load-package', pack);
    return pack;
  }

  unloadPackages() {
    _.keys(this.loadedPackages).forEach((name) => this.unloadPackage(name));
  }

  unloadPackage(name) {
    if (this.isPackageActive(name)) {
      throw new Error(`Tried to unload active package '${name}'`);
    }

    const pack = this.getLoadedPackage(name);
    if (pack) {
      delete this.loadedPackages[pack.name];
      this.emitter.emit('did-unload-package', pack);
    } else {
      throw new Error(`No loaded package for name '${name}'`);
    }
  }

  // Activate all the packages that should be activated.
  activate() {
    let promises = [];
    for (let [activator, types] of this.packageActivators) {
      const packages = this.getLoadedPackagesForTypes(types);
      promises = promises.concat(activator.activatePackages(packages));
    }
    this.activatePromise = Promise.all(promises).then(() => {
      this.triggerDeferredActivationHooks();
      this.initialPackagesActivated = true;
      this.emitter.emit('did-activate-initial-packages');
      this.activatePromise = null;
    });
    return this.activatePromise;
  }

  registerURIHandlerForPackage(packageName, handler) {
    return this.uriHandlerRegistry.registerHostHandler(packageName, handler);
  }

  // another type of package manager can handle other package types.
  // See ThemeManager
  registerPackageActivator(activator, types) {
    this.packageActivators.push([activator, types]);
  }

  activatePackages(packages) {
    const promises = [];
    this.config.transactAsync(() => {
      for (const pack of packages) {
        const promise = this.activatePackage(pack.name);
        if (!pack.activationShouldBeDeferred()) {
          promises.push(promise);
        }
      }
      return Promise.all(promises);
    });
    this.observeDisabledPackages();
    this.observePackagesWithKeymapsDisabled();
    return promises;
  }

  // Activate a single package by name
  async activatePackage(name) {
    let pack = this.getActivePackage(name);
    if (pack) {
      return pack;
    }

    pack = this.loadPackage(name);
    if (!pack) {
      throw new Error(`Failed to load package '${name}'`);
    }

    this.activatingPackages[pack.name] = pack;

    const activatePromise = pack.activate();
    if (this.deferredActivationHooks == null) {
      this.triggeredActivationHooks.forEach((hook) =>
        this.activationHookEmitter.emit(hook)
      );
    }

    await activatePromise;

    if (this.activatingPackages[pack.name] != null) {
      delete this.activatingPackages[pack.name];
      this.activePackages[pack.name] = pack;
      this.emitter.emit('did-activate-package', pack);
    }

    return pack;
  }

  triggerDeferredActivationHooks() {
    if (this.deferredActivationHooks == null) {
      return;
    }

    for (const hook of this.deferredActivationHooks) {
      this.activationHookEmitter.emit(hook);
    }

    this.deferredActivationHooks = null;
  }

  triggerActivationHook(hook) {
    if (hook == null || !_.isString(hook) || hook.length <= 0) {
      return new Error('Cannot trigger an empty activation hook');
    }

    this.triggeredActivationHooks.add(hook);
    if (this.deferredActivationHooks != null) {
      this.deferredActivationHooks.push(hook);
    } else {
      this.activationHookEmitter.emit(hook);
    }
  }

  onDidTriggerActivationHook(hook, callback) {
    if (hook == null || !_.isString(hook) || hook.length <= 0) {
      return;
    }
    return this.activationHookEmitter.on(hook, callback);
  }

  serialize() {
    for (const pack of this.getActivePackages()) {
      this.serializePackage(pack);
    }
    return this.packageStates;
  }

  serializePackage(pack) {
    if (typeof pack.serialize === 'function') {
      this.setPackageState(pack.name, pack.serialize());
    }
  }

  // Deactivate all packages
  async deactivatePackages() {
    await this.config.transactAsync(() =>
      Promise.all(
        this.getLoadedPackages().map((pack) =>
          this.deactivatePackage(pack.name, true)
        )
      )
    );
    this.unobserveDisabledPackages();
    this.unobservePackagesWithKeymapsDisabled();
  }

  // Deactivate the package with the given name
  async deactivatePackage(name, suppressSerialization) {
    const pack = this.getLoadedPackage(name);
    if (pack == null) {
      return;
    }

    if (!suppressSerialization && this.isPackageActive(pack.name)) {
      this.serializePackage(pack);
    }

    const deactivationResult = pack.deactivate();
    if (deactivationResult && typeof deactivationResult.then === 'function') {
      await deactivationResult;
    }

    delete this.activePackages[pack.name];
    delete this.activatingPackages[pack.name];
    this.emitter.emit('did-deactivate-package', pack);
  }

  handleMetadataError(error, packagePath) {
    const metadataPath = path.join(packagePath, 'package.json');
    const detail = `${error.message} in ${metadataPath}`;
    const stack = `${error.stack}\n  at ${metadataPath}:1:1`;
    const message = `Failed to load the ${path.basename(packagePath)} package`;
    this.notificationManager.addError(message, {
      stack,
      detail,
      packageName: path.basename(packagePath),
      dismissable: true,
    });
  }

  uninstallDirectory(directory) {
    const symlinkPromise = new Promise((resolve) =>
      fs.isSymbolicLink(directory, (isSymLink) => resolve(isSymLink))
    );
    const dirPromise = new Promise((resolve) =>
      fs.isDirectory(directory, (isDir) => resolve(isDir))
    );

    return Promise.all([symlinkPromise, dirPromise]).then((values) => {
      const [isSymLink, isDir] = values;
      if (!isSymLink && isDir) {
        return fs.remove(directory, function () { });
      }
    });
  }

  reloadActivePackageStyleSheets() {
    for (const pack of this.getActivePackages()) {
      if (
        pack.getType() !== 'theme' &&
        typeof pack.reloadStylesheets === 'function'
      ) {
        pack.reloadStylesheets();
      }
    }
  }

  isBundledPackagePath(packagePath) {
    return (
      packagePath != null &&
      packagePath.startsWith(atomConfig.rootDir)
    );
  }

  loadPackageMetadataByPath(packagePath, ignoreErrors = false) {
    const name = path.basename(packagePath);
    return this.loadPackageMetadata({
      path: packagePath,
      name,
    }, ignoreErrors);
  }

  loadPackageMetadata(availablePackage, ignoreErrors = false) {
    const packageName = availablePackage.name;
    const packagePath = availablePackage.path;
    let metadata = availablePackage.metadata;

    try {
      if (!metadata) {
        const metadataPath = path.join(packagePath, 'package.json');
        metadata = JSON.parse(fs.readFileSync(metadataPath));
      }
      this.normalizePackageMetadata(metadata);
    } catch (error) {
      if (!ignoreErrors) {
        throw error;
      }
    }

    if (metadata == null) {
      metadata = {};
    }

    if (typeof metadata.name !== 'string' || metadata.name.length <= 0) {
      metadata.name = packageName;
    }

    if (
      metadata.repository &&
      metadata.repository.type === 'git' &&
      typeof metadata.repository.url === 'string'
    ) {
      metadata.repository.url = metadata.repository.url.replace(
        /(^git\+)|(\.git$)/g,
        ''
      );
    }

    return metadata;
  }

  normalizePackageMetadata(metadata) {
    if (metadata != null) {
      normalizePackageData =
        normalizePackageData || require('normalize-package-data');
      normalizePackageData(metadata);
    }
  }
};
