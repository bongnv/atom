const globalModules = {
  'atom': true,
  'remote': true,
  'clipboard': true,
  'ipc': true,
  'shell': true,
};

exports.install = () => {
  var Module = require('module');
  var originalRequire = Module.prototype.require;

  Module.prototype.require = function (name) {
    if (globalModules[name]) {
      return require('../exports/' + name + '.js');
    }

    return originalRequire.apply(this, arguments);
  };
}