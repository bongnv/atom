/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const { calculateSpecificity, validateSelector } = require('clear-cut');
const { Disposable } = require('event-kit');
const remote = require('@electron/remote');
const _ = require('underscore-plus');

const MenuHelpers = require('./menu-helpers');
const { sortMenuItems } = require('./menu-sort-helpers');

// Extended: Provides a registry for commands that you'd like to appear in the
// context menu.
//
// An instance of this class is always available as the `atom.contextMenu`
// global.
//
// ## Context Menu JSON Format
//
// ```coffee
// 'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
// 'atom-text-editor': [{
//   label: 'History',
//   submenu: [
//     {label: 'Undo', command:'core:undo'}
//     {label: 'Redo', command:'core:redo'}
//   ]
// }]
// ```
//
// In your package's menu `.json` file you need to specify it under a
// `context-menu` key:
//
// ```coffee
// 'context-menu':
//   'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
//   ...
// ```
//
// The format for use in {::add} is the same minus the `context-menu` key. See
// {::add} for more information.
module.exports = class ContextMenuManager {
  constructor({ keymapManager }) {
    this.keymapManager = keymapManager;
    this.definitions = { '.overlayer': [] }; // TODO: Remove once color picker package stops touching private data
    this.clear();

    this.keymapManager.onDidLoadBundledKeymaps(() => this.loadPlatformItems());
  }

  initialize({ devMode }) {
    this.devMode = devMode;
  }

  loadPlatformItems() {
    const map = require('../../menus/' + process.platform + '.json');
    return this.add(map['context-menu']);
  }

  // Public: Add context menu items scoped by CSS selectors.
  //
  // ## Examples
  //
  // To add a context menu, pass a selector matching the elements to which you
  // want the menu to apply as the top level key, followed by a menu descriptor.
  // The invocation below adds a global 'Help' context menu item and a 'History'
  // submenu on the editor supporting undo/redo. This is just for example
  // purposes and not the way the menu is actually configured in Atom by default.
  //
  // ```coffee
  // atom.contextMenu.add {
  //   'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
  //   'atom-text-editor': [{
  //     label: 'History',
  //     submenu: [
  //       {label: 'Undo', command:'core:undo'}
  //       {label: 'Redo', command:'core:redo'}
  //     ]
  //   }]
  // }
  // ```
  //
  // ## Arguments
  //
  // * `itemsBySelector` An {Object} whose keys are CSS selectors and whose
  //   values are {Array}s of item {Object}s containing the following keys:
  //   * `label` (optional) A {String} containing the menu item's label.
  //   * `command` (optional) A {String} containing the command to invoke on the
  //     target of the right click that invoked the context menu.
  //   * `enabled` (optional) A {Boolean} indicating whether the menu item
  //     should be clickable. Disabled menu items typically appear grayed out.
  //     Defaults to `true`.
  //   * `submenu` (optional) An {Array} of additional items.
  //   * `type` (optional) If you want to create a separator, provide an item
  //      with `type: 'separator'` and no other keys.
  //   * `visible` (optional) A {Boolean} indicating whether the menu item
  //     should appear in the menu. Defaults to `true`.
  //   * `created` (optional) A {Function} that is called on the item each time a
  //     context menu is created via a right click. You can assign properties to
  //    `this` to dynamically compute the command, label, etc. This method is
  //    actually called on a clone of the original item template to prevent state
  //    from leaking across context menu deployments. Called with the following
  //    argument:
  //     * `event` The click event that deployed the context menu.
  //   * `shouldDisplay` (optional) A {Function} that is called to determine
  //     whether to display this item on a given context menu deployment. Called
  //     with the following argument:
  //     * `event` The click event that deployed the context menu.
  //
  //   * `id` (internal) A {String} containing the menu item's id.
  // Returns a {Disposable} on which `.dispose()` can be called to remove the
  // added menu items.
  add(itemsBySelector, throwOnInvalidSelector = true) {
    let itemSet;
    const addedItemSets = [];

    for (var selector in itemsBySelector) {
      var items = itemsBySelector[selector];
      if (throwOnInvalidSelector) {
        validateSelector(selector);
      }
      itemSet = new ContextMenuItemSet(selector, items);
      addedItemSets.push(itemSet);
      this.itemSets.push(itemSet);
    }

    return new Disposable(() => {
      for (itemSet of addedItemSets) {
        this.itemSets.splice(this.itemSets.indexOf(itemSet), 1);
      }
    });
  }

  templateForElement(target) {
    return this.templateForEvent({ target });
  }

  templateForEvent(event) {
    const template = [];
    let currentTarget = event.target;

    while (currentTarget != null) {
      var item;
      var currentTargetItems = [];
      var matchingItemSets = this.itemSets.filter((itemSet) =>
        currentTarget.webkitMatchesSelector(itemSet.selector)
      );

      for (var itemSet of matchingItemSets) {
        for (item of itemSet.items) {
          var itemForEvent = this.cloneItemForEvent(item, event);
          if (itemForEvent) {
            MenuHelpers.merge(
              currentTargetItems,
              itemForEvent,
              itemSet.specificity
            );
          }
        }
      }

      for (item of currentTargetItems) {
        MenuHelpers.merge(template, item, false);
      }

      currentTarget = currentTarget.parentElement;
    }

    this.pruneRedundantSeparators(template);
    this.addAccelerators(template);

    return this.sortTemplate(template);
  }

  // Adds an `accelerator` property to items that have key bindings. Electron
  // uses this property to surface the relevant keymaps in the context menu.
  addAccelerators(template) {
    return (() => {
      const result = [];
      for (var id in template) {
        var item = template[id];
        if (item.command) {
          var keymaps = this.keymapManager.findKeyBindings({
            command: item.command,
            target: document.activeElement,
          });
          var keystrokes = __guard__(
            keymaps != null ? keymaps[0] : undefined,
            (x2) => x2.keystrokes
          );
          if (keystrokes) {
            // Electron does not support multi-keystroke accelerators. Therefore,
            // when the command maps to a multi-stroke key binding, show the
            // keystrokes next to the item's label.
            if (keystrokes.includes(' ')) {
              item.label += ` [${_.humanizeKeystroke(keystrokes)}]`;
            } else {
              item.accelerator =
                MenuHelpers.acceleratorForKeystroke(keystrokes);
            }
          }
        }
        if (Array.isArray(item.submenu)) {
          result.push(this.addAccelerators(item.submenu));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  pruneRedundantSeparators(menu) {
    let keepNextItemIfSeparator = false;
    let index = 0;
    return (() => {
      const result = [];
      while (index < menu.length) {
        if (menu[index].type === 'separator') {
          if (!keepNextItemIfSeparator || index === menu.length - 1) {
            result.push(menu.splice(index, 1));
          } else {
            result.push(index++);
          }
        } else {
          keepNextItemIfSeparator = true;
          result.push(index++);
        }
      }
      return result;
    })();
  }

  sortTemplate(template) {
    template = sortMenuItems(template);
    for (var id in template) {
      var item = template[id];
      if (Array.isArray(item.submenu)) {
        item.submenu = this.sortTemplate(item.submenu);
      }
    }
    return template;
  }

  // Returns an object compatible with `::add()` or `null`.
  cloneItemForEvent(item, event) {
    if (item.devMode && !this.devMode) {
      return null;
    }
    item = Object.create(item);
    if (typeof item.shouldDisplay === 'function') {
      if (!item.shouldDisplay(event)) {
        return null;
      }
    }
    if (typeof item.created === 'function') {
      item.created(event);
    }
    if (Array.isArray(item.submenu)) {
      item.submenu = item.submenu
        .map((submenuItem) => this.cloneItemForEvent(submenuItem, event))
        .filter((submenuItem) => submenuItem !== null);
    }
    return item;
  }

  showForEvent(event) {
    this.activeElement = event.target;
    const menuTemplate = this.templateForEvent(event);

    if ((menuTemplate != null ? menuTemplate.length : undefined) <= 0) {
      return;
    }
    remote.getCurrentWindow().emit('context-menu', menuTemplate);
  }

  clear() {
    this.activeElement = null;
    this.itemSets = [];
    const inspectElement = {
      'atom-workspace': [
        {
          label: 'Inspect Element',
          command: 'application:inspect',
          devMode: true,
          created(event) {
            const { pageX, pageY } = event;
            return (this.commandDetail = { x: pageX, y: pageY });
          },
        },
      ],
    };
    return this.add(inspectElement, false);
  }
};

class ContextMenuItemSet {
  constructor(selector, items) {
    this.selector = selector;
    this.items = items;
    this.specificity = calculateSpecificity(this.selector);
  }
}

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
