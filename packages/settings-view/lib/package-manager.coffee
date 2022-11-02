_ = require 'underscore-plus'
{BufferedProcess, CompositeDisposable, Emitter} = require 'atom'
semver = require 'semver'

module.exports =
class PackageManager
  # Millisecond expiry for cached loadOutdated, etc. values
  CACHE_EXPIRY: 1000*60*10

  constructor: ->
    @packagePromises = []
    @emitter = new Emitter

  isPackageInstalled: (packageName) ->
    if atom.packages.isPackageLoaded(packageName)
      true
    else
      atom.packages.getAvailablePackageNames().indexOf(packageName) > -1

  packageHasSettings: (packageName) ->
    grammars = atom.grammars.getGrammars() ? []
    for grammar in grammars when grammar.path
      return true if grammar.packageName is packageName

    pack = atom.packages.getLoadedPackage(packageName)
    pack.activateConfig() if pack? and not atom.packages.isPackageActive(packageName)
    schema = atom.config.getSchema(packageName)
    schema? and (schema.type isnt 'any')

  # FIXME: bongnv - implement a different approach to load packages
  # find a way to differentiate core and installed
  loadInstalled: (callback) ->
    callback(null, {
      core: atom.packages.getAvailablePackageMetadata(),
      dev: [],
      user: [],
      deprecated: [],
      git: [],
    })

  getVersionPinnedPackages: ->
    atom.config.get('core.versionPinnedPackages') ? []

  loadPackage: (packageName, callback) ->
    args = ['view', packageName, '--json']
    errorMessage = "Fetching package '#{packageName}' failed."
    # TODO: bongnv - find a way to load packages
    callback(null, [])

  loadCompatiblePackageVersion: (packageName, callback) ->
    args = ['view', packageName, '--json', '--compatible', @normalizeVersion(atom.getVersion())]
    errorMessage = "Fetching package '#{packageName}' failed."
    # TODO: bongnv - find a way to load compatible packages
    callback(null, [])

  getInstalled: ->
    new Promise (resolve, reject) =>
      @loadInstalled (error, result) ->
        if error
          reject(error)
        else
          resolve(result)

  getPackage: (packageName) ->
    @packagePromises[packageName] ?= new Promise (resolve, reject) =>
      @loadPackage packageName, (error, result) ->
        if error
          reject(error)
        else
          resolve(result)

  satisfiesVersion: (version, metadata) ->
    engine = metadata.engines?.atom ? '*'
    return false unless semver.validRange(engine)
    return semver.satisfies(version, engine)

  normalizeVersion: (version) ->
    [version] = version.split('-') if typeof version is 'string'
    version

  unload: (name) ->
    if atom.packages.isPackageLoaded(name)
      atom.packages.deactivatePackage(name) if atom.packages.isPackageActive(name)
      atom.packages.unloadPackage(name)

  installAlternative: (pack, alternativePackageName, callback) ->
    eventArg = {pack, alternative: alternativePackageName}
    @emitter.emit('package-installing-alternative', eventArg)

    uninstallPromise = new Promise (resolve, reject) =>
      @uninstall pack, (error) ->
        if error then reject(error) else resolve()

    installPromise = new Promise (resolve, reject) =>
      @install {name: alternativePackageName}, (error) ->
        if error then reject(error) else resolve()

    Promise.all([uninstallPromise, installPromise]).then =>
      callback(null, eventArg)
      @emitter.emit('package-installed-alternative', eventArg)
    .catch (error) =>
      console.error error.message, error.stack
      callback(error, eventArg)
      eventArg.error = error
      @emitter.emit('package-install-alternative-failed', eventArg)

  getPackageTitle: ({name}) ->
    _.undasherize(_.uncamelcase(name))

  getRepositoryUrl: ({metadata}) ->
    {repository} = metadata
    repoUrl = repository?.url ? repository ? ''
    if repoUrl.match 'git@github'
      repoName = repoUrl.split(':')[1]
      repoUrl = "https://github.com/#{repoName}"
    repoUrl.replace(/\.git$/, '').replace(/\/+$/, '').replace(/^git\+/, '')

  getRepositoryBugUri: ({metadata}) ->
    {bugs} = metadata
    if typeof bugs is 'string'
      bugUri = bugs
    else
      bugUri = bugs?.url ? bugs?.email ? this.getRepositoryUrl({metadata}) + '/issues/new'
      if bugUri.includes('@')
        bugUri = 'mailto:' + bugUri
    bugUri

  checkNativeBuildTools: ->
    new Promise (resolve, reject) =>
      # TODO: bongnv - improve this
      resolve()

  removePackageNameFromDisabledPackages: (packageName) ->
    atom.config.removeAtKeyPath('core.disabledPackages', packageName)

  on: (selectors, callback) ->
    subscriptions = new CompositeDisposable
    for selector in selectors.split(" ")
      subscriptions.add @emitter.on(selector, callback)
    subscriptions
