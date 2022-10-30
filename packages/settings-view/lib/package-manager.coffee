_ = require 'underscore-plus'
{BufferedProcess, CompositeDisposable, Emitter} = require 'atom'
semver = require 'semver'

Client = require './atom-io-client'

module.exports =
class PackageManager
  # Millisecond expiry for cached loadOutdated, etc. values
  CACHE_EXPIRY: 1000*60*10

  constructor: ->
    @packagePromises = []
    @emitter = new Emitter

  getClient: ->
    @client ?= new Client(this)

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

  setProxyServers: (callback) =>
    session = atom.getCurrentWindow().webContents.session
    session.resolveProxy 'http://atom.io', (httpProxy) =>
      @applyProxyToEnv('http_proxy', httpProxy)
      session.resolveProxy 'https://atom.io', (httpsProxy) =>
        @applyProxyToEnv('https_proxy', httpsProxy)
        callback()

  setProxyServersAsync: (callback) =>
    httpProxyPromise = atom.resolveProxy('http://atom.io').then((proxy) => @applyProxyToEnv('http_proxy', proxy))
    httpsProxyPromise = atom.resolveProxy('https://atom.io').then((proxy) => @applyProxyToEnv('https_proxy', proxy))
    Promise.all([httpProxyPromise, httpsProxyPromise]).then(callback)

  applyProxyToEnv: (envName, proxy) ->
    if proxy?
      proxy = proxy.split(' ')
      switch proxy[0].trim().toUpperCase()
        when 'DIRECT' then delete process.env[envName]
        when 'PROXY'  then process.env[envName] = 'http://' + proxy[1]
    return

  runCommand: (args, callback) ->
    command = atom.packages.getApmPath()
    outputLines = []
    stdout = (lines) -> outputLines.push(lines)
    errorLines = []
    stderr = (lines) -> errorLines.push(lines)
    exit = (code) ->
      callback(code, outputLines.join('\n'), errorLines.join('\n'))

    args.push('--no-color')

    return new BufferedProcess({command, args, stdout, stderr, exit})

  # FIXME: bongnv - implement a different approach to load packages
  loadInstalled: (callback) ->
    callback(null, {
      core: [],
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

    apmProcess = @runCommand args, (code, stdout, stderr) ->
      if code is 0
        try
          packages = JSON.parse(stdout) ? []
        catch parseError
          error = createJsonParseError(errorMessage, parseError, stdout)
          return callback(error)

        callback(null, packages)
      else
        error = new Error(errorMessage)
        error.stdout = stdout
        error.stderr = stderr
        callback(error)

    handleProcessErrors(apmProcess, errorMessage, callback)

  loadCompatiblePackageVersion: (packageName, callback) ->
    args = ['view', packageName, '--json', '--compatible', @normalizeVersion(atom.getVersion())]
    errorMessage = "Fetching package '#{packageName}' failed."

    apmProcess = @runCommand args, (code, stdout, stderr) ->
      if code is 0
        try
          packages = JSON.parse(stdout) ? []
        catch parseError
          error = createJsonParseError(errorMessage, parseError, stdout)
          return callback(error)

        callback(null, packages)
      else
        error = new Error(errorMessage)
        error.stdout = stdout
        error.stderr = stderr
        callback(error)

    handleProcessErrors(apmProcess, errorMessage, callback)

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

  canUpgrade: (installedPackage, availableVersion) ->
    return false unless installedPackage?

    installedVersion = installedPackage.metadata.version
    return false unless semver.valid(installedVersion)
    return false unless semver.valid(availableVersion)

    semver.gt(availableVersion, installedVersion)

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
      apmProcess = @runCommand ['install', '--check'], (code, stdout, stderr) ->
        if code is 0
          resolve()
        else
          reject(new Error())

      apmProcess.onWillThrowError ({error, handle}) ->
        handle()
        reject(error)

  removePackageNameFromDisabledPackages: (packageName) ->
    atom.config.removeAtKeyPath('core.disabledPackages', packageName)

  on: (selectors, callback) ->
    subscriptions = new CompositeDisposable
    for selector in selectors.split(" ")
      subscriptions.add @emitter.on(selector, callback)
    subscriptions

createJsonParseError = (message, parseError, stdout) ->
  error = new Error(message)
  error.stdout = ''
  error.stderr = "#{parseError.message}: #{stdout}"
  error

createProcessError = (message, processError) ->
  error = new Error(message)
  error.stdout = ''
  error.stderr = processError.message
  error

handleProcessErrors = (apmProcess, message, callback) ->
  apmProcess.onWillThrowError ({error, handle}) ->
    handle()
    callback(createProcessError(message, error))
