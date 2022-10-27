const { remote } = require('electron');
const atomConfig = require('../shared/config');

let windowLoadSettings = null;

module.exports = () => {
  if (!windowLoadSettings) {
    windowLoadSettings = JSON.parse(remote.getCurrentWindow().loadSettingsJSON);
    windowLoadSettings.resourcePath = atomConfig.rootDir;
  }
  return windowLoadSettings;
};
