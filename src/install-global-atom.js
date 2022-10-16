exports.install = () => {
  var Module = require('module');
  var originalRequire = Module.prototype.require;

  Module.prototype.require = function (name) {
    if (name == 'atom' || name == 'remote' || name == 'clipboard' || name == 'ipc' || name == 'shell') {
      // console.log(`${name} is loaded in exports`);
      return require('../exports/' + name + '.js');
    }

    //do your thing here
    return originalRequire.apply(this, arguments);
  };
}