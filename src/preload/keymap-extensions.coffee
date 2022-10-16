fs = require 'fs-plus'
path = require 'path'
KeymapManager = require 'atom-keymap'
CSON = require 'season'

bundledKeymaps = require('../../package.json')?._atomKeymaps

KeymapManager::onDidLoadBundledKeymaps = (callback) ->
  @emitter.on 'did-load-bundled-keymaps', callback

KeymapManager::onDidLoadUserKeymap = (callback) ->
  @emitter.on 'did-load-user-keymap', callback

KeymapManager::canLoadBundledKeymapsFromMemory = ->
  true

KeymapManager::loadBundledKeymaps = ->
  @add("core:base", require("../../keymaps/base.cson"), 0, @devMode ? false)
  @add("core:darwin", require("../../keymaps/darwin.cson"), 0, @devMode ? false)
  @add("core:linux", require("../../keymaps/linux.cson"), 0, @devMode ? false)
  @add("core:win32", require("../../keymaps/win32.cson"), 0, @devMode ? false)

  @emitter.emit 'did-load-bundled-keymaps'

KeymapManager::getUserKeymapPath = ->
  return "" unless @configDirPath?

  if userKeymapPath = CSON.resolve(path.join(@configDirPath, 'keymap'))
    userKeymapPath
  else
    path.join(@configDirPath, 'keymap.cson')

KeymapManager::loadUserKeymap = ->
  userKeymapPath = @getUserKeymapPath()
  return unless fs.isFileSync(userKeymapPath)

  try
    @loadKeymap(userKeymapPath, watch: true, suppressErrors: true, priority: 100)
  catch error
    if error.message.indexOf('Unable to watch path') > -1
      message = """
        Unable to watch path: `#{path.basename(userKeymapPath)}`. Make sure you
        have permission to read `#{userKeymapPath}`.

        On linux there are currently problems with watch sizes. See
        [this document][watches] for more info.
        [watches]:https://github.com/atom/atom/blob/master/docs/build-instructions/linux.md#typeerror-unable-to-watch-path
      """
      @notificationManager.addError(message, {dismissable: true})
    else
      detail = error.path
      stack = error.stack
      @notificationManager.addFatalError(error.message, {detail, stack, dismissable: true})

  @emitter.emit 'did-load-user-keymap'


KeymapManager::subscribeToFileReadFailure = ->
  @onDidFailToReadFile (error) =>
    userKeymapPath = @getUserKeymapPath()
    message = "Failed to load `#{userKeymapPath}`"

    detail = if error.location?
      error.stack
    else
      error.message

    @notificationManager.addError(message, {detail, dismissable: true})

module.exports = KeymapManager
