const { Disposable } = require('atom');
const etch = require('etch');
const { shell } = require('electron');
const AtomLogo = require('./atom-logo');
const EtchComponent = require('../etch-component');

const $ = etch.dom;

module.exports = class AboutView extends EtchComponent {
  handleAtomVersionClick(e) {
    e.preventDefault();
    atom.clipboard.write(this.props.currentAtomVersion);
  }

  handleElectronVersionClick(e) {
    e.preventDefault();
    atom.clipboard.write(this.props.currentElectronVersion);
  }

  handleChromeVersionClick(e) {
    e.preventDefault();
    atom.clipboard.write(this.props.currentChromeVersion);
  }

  handleNodeVersionClick(e) {
    e.preventDefault();
    atom.clipboard.write(this.props.currentNodeVersion);
  }

  handleLicenseClick(e) {
    e.preventDefault();
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'application:open-license'
    );
  }

  handleTermsOfUseClick(e) {
    e.preventDefault();
    shell.openExternal('https://atom.io/terms');
  }

  handleShowMoreClick(e) {
    e.preventDefault();
    var showMoreDiv = document.querySelector('.show-more');
    var showMoreText = document.querySelector('.about-more-expand');
    switch (showMoreText.textContent) {
      case 'Show more':
        showMoreDiv.classList.toggle('hidden');
        showMoreText.textContent = 'Hide';
        break;
      case 'Hide':
        showMoreDiv.classList.toggle('hidden');
        showMoreText.textContent = 'Show more';
        break;
    }
  }

  render() {
    return $.div(
      { className: 'pane-item native-key-bindings about' },
      $.div(
        { className: 'about-container' },
        $.header(
          { className: 'about-header' },
          $.a(
            { className: 'about-atom-io', href: 'https://atom.io' },
            $(AtomLogo)
          ),
          $.div(
            { className: 'about-header-info' },
            $.span(
              {
                className: 'about-version-container inline-block atom',
                onclick: this.handleAtomVersionClick.bind(this),
              },
              $.span(
                { className: 'about-version' },
                `${this.props.currentAtomVersion} ${process.arch}`
              ),
              $.span({ className: 'icon icon-clippy about-copy-version' })
            )
          ),
          $.span(
            {
              className:
                'about-version-container inline-block show-more-expand',
              onclick: this.handleShowMoreClick.bind(this),
            },
            $.span({ className: 'about-more-expand' }, 'Show more')
          ),
          $.div(
            { className: 'show-more hidden about-more-info' },
            $.div(
              { className: 'about-more-info' },
              $.span(
                {
                  className: 'about-version-container inline-block electron',
                  onclick: this.handleElectronVersionClick.bind(this),
                },
                $.span(
                  { className: 'about-more-version' },
                  `Electron: ${this.props.currentElectronVersion} `
                ),
                $.span({ className: 'icon icon-clippy about-copy-version' })
              )
            ),
            $.div(
              { className: 'about-more-info' },
              $.span(
                {
                  className: 'about-version-container inline-block chrome',
                  onclick: this.handleChromeVersionClick.bind(this),
                },
                $.span(
                  { className: 'about-more-version' },
                  `Chrome: ${this.props.currentChromeVersion} `
                ),
                $.span({ className: 'icon icon-clippy about-copy-version' })
              )
            ),
            $.div(
              { className: 'about-more-info' },
              $.span(
                {
                  className: 'about-version-container inline-block node',
                  onclick: this.handleNodeVersionClick.bind(this),
                },
                $.span(
                  { className: 'about-more-version' },
                  `Node: ${this.props.currentNodeVersion} `
                ),
                $.span({ className: 'icon icon-clippy about-copy-version' })
              )
            )
          )
        )
      ),

      $.div(
        { className: 'about-actions group-item' },
        $.div(
          { className: 'btn-group' },
          $.button(
            {
              className: 'btn view-license',
              onclick: this.handleLicenseClick.bind(this),
            },
            'License'
          ),
          $.button(
            {
              className: 'btn terms-of-use',
              onclick: this.handleTermsOfUseClick.bind(this),
            },
            'Terms of Use'
          )
        )
      ),

      $.div(
        { className: 'about-love group-start' },
        $.span({ className: 'icon icon-code' }),
        $.span({ className: 'inline' }, ' with '),
        $.span({ className: 'icon icon-heart' }),
        $.span({ className: 'inline' }, ' by '),
        $.a({ className: 'icon icon-logo-github', href: 'https://github.com' })
      ),

      $.div(
        { className: 'about-credits group-item' },
        $.span({ className: 'inline' }, 'And the awesome '),
        $.a(
          { href: 'https://github.com/atom/atom/contributors' },
          'Atom Community'
        )
      )
    );
  }

  serialize() {
    return {
      deserializer: this.constructor.name,
      uri: this.props.uri,
    };
  }

  onDidChangeTitle() {
    return new Disposable();
  }

  onDidChangeModified() {
    return new Disposable();
  }

  getTitle() {
    return 'About';
  }

  getIconName() {
    return 'info';
  }
};
