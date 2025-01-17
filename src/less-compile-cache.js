/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const path = require('path');
const LessCache = require('less-cache');

// {LessCache} wrapper used by {ThemeManager} to read stylesheets.
module.exports = class LessCompileCache {
  constructor({
    resourcePath,
    importPaths,
    lessSourcesByRelativeFilePath,
    importedFilePathsByRelativeImportPath,
  }) {
    const cacheDir = path.join(process.env.ATOM_HOME, 'compile-cache', 'less');

    this.lessSearchPaths = [
      path.join(resourcePath, 'static', 'variables'),
      path.join(resourcePath, 'static'),
    ];

    if (importPaths != null) {
      importPaths = importPaths.concat(this.lessSearchPaths);
    } else {
      importPaths = this.lessSearchPaths;
    }

    this.cache = new LessCache({
      importPaths,
      resourcePath,
      lessSourcesByRelativeFilePath,
      importedFilePathsByRelativeImportPath,
      cacheDir,
      fallbackDir: path.join(resourcePath, 'less-compile-cache'),
    });
  }

  setImportPaths(importPaths = []) {
    return this.cache.setImportPaths(importPaths.concat(this.lessSearchPaths));
  }

  read(stylesheetPath) {
    return this.cache.readFileSync(stylesheetPath);
  }

  cssForFile(stylesheetPath, lessContent, digest) {
    return this.cache.cssForFile(stylesheetPath, lessContent, digest);
  }
};
