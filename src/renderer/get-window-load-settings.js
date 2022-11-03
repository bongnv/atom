const remote = require('@electron/remote');
const atomConfig = require('../shared/path-config');

let windowLoadSettings = null;

module.exports = () => {
  if (!windowLoadSettings) {
    windowLoadSettings = JSON.parse(remote.getCurrentWindow().loadSettingsJSON);
    windowLoadSettings.resourcePath = atomConfig.rootDir;
  }
  return windowLoadSettings;
};
