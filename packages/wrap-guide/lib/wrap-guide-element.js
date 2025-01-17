/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let WrapGuideElement;
const { CompositeDisposable } = require('atom');

module.exports = WrapGuideElement = class WrapGuideElement {
  constructor(editor, editorElement) {
    this.editor = editor;
    this.editorElement = editorElement;
    this.subscriptions = new CompositeDisposable();
    this.configSubscriptions = new CompositeDisposable();
    this.element = document.createElement('div');
    this.element.setAttribute('is', 'wrap-guide');
    this.element.classList.add('wrap-guide-container');
    this.attachToLines();
    this.handleEvents();
    this.updateGuide();

    this.element.updateGuide = this.updateGuide.bind(this);
    this.element.getDefaultColumn = this.getDefaultColumn.bind(this);
  }

  attachToLines() {
    const scrollView = this.editorElement.querySelector('.scroll-view');
    return scrollView != null
      ? scrollView.appendChild(this.element)
      : undefined;
  }

  handleEvents() {
    const updateGuideCallback = () => this.updateGuide();

    this.handleConfigEvents();

    this.subscriptions.add(
      atom.config.onDidChange('editor.fontSize', () => {
        // Wait for editor to finish updating before updating wrap guide
        // TODO: Use async/await once this file is converted to JS
        return this.editorElement
          .getComponent()
          .getNextUpdatePromise()
          .then(() => updateGuideCallback());
      })
    );

    this.subscriptions.add(
      this.editorElement.onDidChangeScrollLeft(updateGuideCallback)
    );
    this.subscriptions.add(this.editor.onDidChangePath(updateGuideCallback));
    this.subscriptions.add(
      this.editor.onDidChangeGrammar(() => {
        this.configSubscriptions.dispose();
        this.handleConfigEvents();
        return updateGuideCallback();
      })
    );

    this.subscriptions.add(
      this.editor.onDidDestroy(() => {
        this.subscriptions.dispose();
        return this.configSubscriptions.dispose();
      })
    );

    return this.subscriptions.add(
      this.editorElement.onDidAttach(() => {
        this.attachToLines();
        return updateGuideCallback();
      })
    );
  }

  handleConfigEvents() {
    const { uniqueAscending } = require('./main');

    const updatePreferredLineLengthCallback = (args) => {
      // ensure that the right-most wrap guide is the preferredLineLength
      let columns = atom.config.get('wrap-guide.columns', {
        scope: this.editor.getRootScopeDescriptor(),
      });
      if (columns.length > 0) {
        columns[columns.length - 1] = args.newValue;
        columns = uniqueAscending(columns.filter((i) => i <= args.newValue));
        atom.config.set('wrap-guide.columns', columns, {
          scopeSelector: `.${this.editor.getGrammar().scopeName}`,
        });
      }
      return this.updateGuide();
    };
    this.configSubscriptions.add(
      atom.config.onDidChange(
        'editor.preferredLineLength',
        { scope: this.editor.getRootScopeDescriptor() },
        updatePreferredLineLengthCallback
      )
    );

    const updateGuideCallback = () => this.updateGuide();
    this.configSubscriptions.add(
      atom.config.onDidChange(
        'wrap-guide.enabled',
        { scope: this.editor.getRootScopeDescriptor() },
        updateGuideCallback
      )
    );

    const updateGuidesCallback = (args) => {
      // ensure that multiple guides stay sorted in ascending order
      const columns = uniqueAscending(args.newValue);
      if (columns != null ? columns.length : undefined) {
        atom.config.set('wrap-guide.columns', columns);
        atom.config.set(
          'editor.preferredLineLength',
          columns[columns.length - 1],
          { scopeSelector: `.${this.editor.getGrammar().scopeName}` }
        );
        return this.updateGuide();
      }
    };
    return this.configSubscriptions.add(
      atom.config.onDidChange(
        'wrap-guide.columns',
        { scope: this.editor.getRootScopeDescriptor() },
        updateGuidesCallback
      )
    );
  }

  getDefaultColumn() {
    return atom.config.get('editor.preferredLineLength', {
      scope: this.editor.getRootScopeDescriptor(),
    });
  }

  getGuidesColumns(path, scopeName) {
    let left;
    const columns =
      (left = atom.config.get('wrap-guide.columns', {
        scope: this.editor.getRootScopeDescriptor(),
      })) != null
        ? left
        : [];
    if (columns.length > 0) {
      return columns;
    }
    return [this.getDefaultColumn()];
  }

  isEnabled() {
    let left;
    return (left = atom.config.get('wrap-guide.enabled', {
      scope: this.editor.getRootScopeDescriptor(),
    })) != null
      ? left
      : true;
  }

  hide() {
    return (this.element.style.display = 'none');
  }

  show() {
    return (this.element.style.display = 'block');
  }

  updateGuide() {
    if (this.isEnabled()) {
      return this.updateGuides();
    } else {
      return this.hide();
    }
  }

  updateGuides() {
    this.removeGuides();
    this.appendGuides();
    if (this.element.children.length) {
      return this.show();
    } else {
      return this.hide();
    }
  }

  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
    return this.configSubscriptions.dispose();
  }

  removeGuides() {
    return (() => {
      const result = [];
      while (this.element.firstChild) {
        result.push(this.element.removeChild(this.element.firstChild));
      }
      return result;
    })();
  }

  appendGuides() {
    const columns = this.getGuidesColumns(
      this.editor.getPath(),
      this.editor.getGrammar().scopeName
    );
    return (() => {
      const result = [];
      for (var column of columns) {
        if (column >= 0) {
          result.push(this.appendGuide(column));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  appendGuide(column) {
    let columnWidth = this.editorElement.getDefaultCharacterWidth() * column;
    columnWidth -= this.editorElement.getScrollLeft();
    const guide = document.createElement('div');
    guide.classList.add('wrap-guide');
    guide.style.left = `${Math.round(columnWidth)}px`;
    return this.element.appendChild(guide);
  }
};
