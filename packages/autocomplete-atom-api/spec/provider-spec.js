/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const temp = require('temp');

describe('Atom API autocompletions', function () {
  let [editor, provider] = Array.from([]);

  const getCompletions = function () {
    const cursor = editor.getLastCursor();
    const start = cursor.getBeginningOfCurrentWordBufferPosition();
    const end = cursor.getBufferPosition();
    const prefix = editor.getTextInRange([start, end]);
    const request = {
      editor,
      bufferPosition: end,
      scopeDescriptor: cursor.getScopeDescriptor(),
      prefix,
    };
    return provider.getSuggestions(request);
  };

  beforeEach(function () {
    waitsForPromise(() =>
      atom.packages.activatePackage('autocomplete-atom-api')
    );
    runs(
      () =>
        (provider = atom.packages
          .getActivePackage('autocomplete-atom-api')
          .mainModule.getProvider())
    );
    waitsFor(() => Object.keys(provider.completions).length > 0);
    waitsFor(
      () =>
        (provider.packageDirectories != null
          ? provider.packageDirectories.length
          : undefined) > 0
    );
    waitsForPromise(() => atom.workspace.open('test.js'));
    return runs(() => (editor = atom.workspace.getActiveTextEditor()));
  });

  it('only includes completions in files that are in an Atom package or Atom core', function () {
    const emptyProjectPath = temp.mkdirSync('atom-project-');
    atom.project.setPaths([emptyProjectPath]);

    waitsForPromise(() => atom.workspace.open('empty.js'));

    return runs(function () {
      expect(provider.packageDirectories.length).toBe(0);
      editor = atom.workspace.getActiveTextEditor();
      editor.setText('atom.');
      editor.setCursorBufferPosition([0, Infinity]);

      return expect(getCompletions()).toBeUndefined();
    });
  });

  it('only includes completions in .atom/init', function () {
    const emptyProjectPath = temp.mkdirSync('some-guy');
    atom.project.setPaths([emptyProjectPath]);

    waitsForPromise(() => atom.workspace.open('.atom/init.coffee'));

    return runs(function () {
      expect(provider.packageDirectories.length).toBe(0);
      editor = atom.workspace.getActiveTextEditor();
      editor.setText('atom.');
      editor.setCursorBufferPosition([0, Infinity]);

      return expect(getCompletions()).not.toBeUndefined();
    });
  });

  it('does not fail when no editor path', function () {
    const emptyProjectPath = temp.mkdirSync('some-guy');
    atom.project.setPaths([emptyProjectPath]);

    waitsForPromise(() => atom.workspace.open());

    return runs(function () {
      expect(provider.packageDirectories.length).toBe(0);
      editor = atom.workspace.getActiveTextEditor();
      editor.setText('atom.');
      editor.setCursorBufferPosition([0, Infinity]);
      return expect(getCompletions()).toBeUndefined();
    });
  });

  it('includes properties and functions on the atom global', function () {
    editor.setText('atom.');
    editor.setCursorBufferPosition([0, Infinity]);

    expect(getCompletions().length).toBe(53);
    expect(getCompletions()[0].text).toBe('clipboard');

    editor.setText('var c = atom.');
    editor.setCursorBufferPosition([0, Infinity]);

    expect(getCompletions().length).toBe(53);
    expect(getCompletions()[0].text).toBe('clipboard');

    editor.setText('atom.c');
    editor.setCursorBufferPosition([0, Infinity]);
    expect(getCompletions().length).toBe(7);
    expect(getCompletions()[0].text).toBe('clipboard');
    expect(getCompletions()[0].type).toBe('property');
    expect(getCompletions()[0].leftLabel).toBe('Clipboard');
    expect(getCompletions()[1].text).toBe('commands');
    expect(getCompletions()[2].text).toBe('config');
    expect(getCompletions()[6].snippet).toBe('confirm(${1:options})');
    expect(getCompletions()[6].type).toBe('method');
    expect(getCompletions()[6].leftLabel).toBe('Number');
    return expect(getCompletions()[6].descriptionMoreURL).toBe(
      'https://atom.io/docs/api/latest/AtomEnvironment#instance-confirm'
    );
  });

  return it('includes methods on atom global properties', function () {
    editor.setText('atom.clipboard.');
    editor.setCursorBufferPosition([0, Infinity]);

    expect(getCompletions().length).toBe(3);
    expect(getCompletions()[0].text).toBe('read()');
    expect(getCompletions()[1].text).toBe('readWithMetadata()');
    expect(getCompletions()[2].snippet).toBe('write(${1:text}, ${2:metadata})');

    editor.setText('atom.clipboard.rea');
    editor.setCursorBufferPosition([0, Infinity]);

    expect(getCompletions().length).toBe(2);
    expect(getCompletions()[0].text).toBe('read()');
    return expect(getCompletions()[1].text).toBe('readWithMetadata()');
  });
});
