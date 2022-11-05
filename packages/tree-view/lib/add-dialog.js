/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let AddDialog;
const path = require('path');
const fs = require('fs-plus');
const Dialog = require('./dialog');
const {repoForPath} = require('./helpers');

module.exports =
(AddDialog = class AddDialog extends Dialog {
  constructor(initialPath, isCreatingFile) {
    let directoryPath;

    if (fs.isFileSync(initialPath)) {
      directoryPath = path.dirname(initialPath);
    } else {
      directoryPath = initialPath;
    }

    let [rootProjectPath, relativeDirectoryPath] = Array.from(atom.project.relativizePath(directoryPath));
    if (relativeDirectoryPath.length > 0) { relativeDirectoryPath += path.sep; }

    super({
      prompt: "Enter the path for the new " + (isCreatingFile ? "file." : "folder."),
      initialPath: relativeDirectoryPath,
      select: false,
      iconClass: isCreatingFile ? 'icon-file-add' : 'icon-file-directory-create'
    });
    this.isCreatingFile = isCreatingFile;
    this.rootProjectPath = rootProjectPath;
  }

  onDidCreateFile(callback) {
    return this.emitter.on('did-create-file', callback);
  }

  onDidCreateDirectory(callback) {
    return this.emitter.on('did-create-directory', callback);
  }

  onConfirm(newPath) {
    newPath = newPath.replace(/\s+$/, ''); // Remove trailing whitespace
    const endsWithDirectorySeparator = newPath[newPath.length - 1] === path.sep;
    if (!path.isAbsolute(newPath)) {
      if (this.rootProjectPath == null) {
        this.showError("You must open a directory to create a file with a relative path");
        return;
      }

      newPath = path.join(this.rootProjectPath, newPath);
    }

    if (!newPath) { return; }

    try {
      if (fs.existsSync(newPath)) {
        return this.showError(`'${newPath}' already exists.`);
      } else if (this.isCreatingFile) {
        if (endsWithDirectorySeparator) {
          return this.showError(`File names must not end with a '${path.sep}' character.`);
        } else {
          fs.writeFileSync(newPath, '');
          __guard__(repoForPath(newPath), x => x.getPathStatus(newPath));
          this.emitter.emit('did-create-file', newPath);
          return this.close();
        }
      } else {
        fs.makeTreeSync(newPath);
        this.emitter.emit('did-create-directory', newPath);
        return this.cancel();
      }
    } catch (error) {
      return this.showError(`${error.message}.`);
    }
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
