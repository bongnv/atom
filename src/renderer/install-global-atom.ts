let installed = false;

const install = () => {
  if (installed) {
    return;
  }
  installed = true;

  var Module = require('module');
  var originalRequire = Module.prototype.require;

  Module.prototype.require = function(name: string) {
    if (name == 'atom') {
      return require('./atom.js');
    }

    return originalRequire.apply(this, arguments);
  };
};

module.exports = install();
