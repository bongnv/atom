let installed = false;

install = () => {
  if (installed) {
    return;
  }

  var Module = require('module');
  var originalRequire = Module.prototype.require;

  Module.prototype.require = function (name) {
    if (name == "atom") {
      return require('./atom.js');
    }

    return originalRequire.apply(this, arguments);
  };
  installed = true;
};

module.exports = install();
