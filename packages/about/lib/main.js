const { CompositeDisposable } = require('atom');
const About = require('./about');

const AboutURI = 'atom://about';

module.exports = {
  activate() {
    this.subscriptions = new CompositeDisposable();

    this.createModel();
  },

  deactivate() {
    this.model.destroy();
    if (this.statusBarTile) this.statusBarTile.destroy();
  },

  deserializeAboutView(state) {
    if (!this.model) {
      this.createModel();
    }

    return this.model.deserialize(state);
  },

  createModel() {
    this.model = new About({
      uri: AboutURI,
      currentAtomVersion: atom.getVersion(),
      currentElectronVersion: process.versions.electron,
      currentChromeVersion: process.versions.chrome,
      currentNodeVersion: process.version,
    });
  },
};
