/* global emit */

const async = require('async');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Minimatch } = require('minimatch');
const childProcess = require('child_process');
const { rgPath } = require('vscode-ripgrep');

const PathsChunkSize = 100;

// Use the unpacked path if the ripgrep binary is in asar archive.
const realRgPath = rgPath.replace(/\bapp\.asar\b/, 'app.asar.unpacked');

// Define the maximum number of concurrent crawling processes based on the number of CPUs
// with a maximum value of 8 and minimum of 1.
const MaxConcurrentCrawls = Math.min(Math.max(os.cpus().length - 1, 8), 1);

const emittedPaths = new Set();

class PathLoader {
  constructor(
    rootPath,
    ignoreVcsIgnores,
    traverseSymlinkDirectories,
    ignoredNames
  ) {
    this.rootPath = rootPath;
    this.ignoreVcsIgnores = ignoreVcsIgnores;
    this.traverseSymlinkDirectories = traverseSymlinkDirectories;
    this.ignoredNames = ignoredNames;
    this.paths = [];
    this.inodes = new Set();
  }

  load(done) {
    this.loadFromRipGrep().then(done);
    return;
  }

  async loadFromRipGrep() {
    return new Promise((resolve) => {
      const args = ['--files', '--hidden', '--sort', 'path'];

      if (!this.ignoreVcsIgnores) {
        args.push('--no-ignore');
      }

      if (this.traverseSymlinkDirectories) {
        args.push('--follow');
      }

      for (let ignoredName of this.ignoredNames) {
        args.push('-g', '!' + ignoredName.pattern);
      }

      if (this.ignoreVcsIgnores) {
        if (!args.includes('!.git')) args.push('-g', '!.git');
        if (!args.includes('!.hg')) args.push('-g', '!.hg');
      }

      let output = '';
      const result = childProcess.spawn(realRgPath, args, {
        cwd: this.rootPath,
      });

      result.stdout.on('data', (chunk) => {
        const files = (output + chunk).split('\n');
        output = files.pop();

        for (const file of files) {
          this.pathLoaded(path.join(this.rootPath, file));
        }
      });
      result.stderr.on('data', () => {
        // intentionally ignoring errors for now
      });
      result.on('close', () => {
        this.flushPaths();
        resolve();
      });
    });
  }

  pathLoaded(loadedPath, done) {
    if (!emittedPaths.has(loadedPath)) {
      this.paths.push(loadedPath);
      emittedPaths.add(loadedPath);
    }

    if (this.paths.length === PathsChunkSize) {
      this.flushPaths();
    }
    done && done();
  }

  flushPaths() {
    emit('load-paths:paths-found', this.paths);
    this.paths = [];
  }
}

module.exports = function (
  rootPaths,
  followSymlinks,
  ignoreVcsIgnores,
  ignores
) {
  const ignoredNames = [];
  for (let ignore of ignores) {
    if (ignore) {
      try {
        ignoredNames.push(
          new Minimatch(ignore, { matchBase: true, dot: true })
        );
      } catch (error) {
        console.warn(
          `Error parsing ignore pattern (${ignore}): ${error.message}`
        );
      }
    }
  }

  async.eachLimit(
    rootPaths,
    MaxConcurrentCrawls,
    (rootPath, next) =>
      new PathLoader(
        rootPath,
        ignoreVcsIgnores,
        followSymlinks,
        ignoredNames
      ).load(next),
    this.async()
  );
};
