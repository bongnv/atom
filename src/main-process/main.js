const startTime = Date.now();
const StartupTime = require('../startup-time');
StartupTime.setStartTime();

const path = require('path');
const fs = require('fs-plus');
const CSON = require('season');
const yargs = require('yargs');
const { app } = require('electron');

const args = yargs(process.argv)
  // Don't handle --help or --version here; they will be handled later.
  .help(false)
  .version(false)
  .alias('d', 'dev')
  .alias('t', 'test').argv;

function isAtomRepoPath(repoPath) {
  let packageJsonPath = path.join(repoPath, 'package.json');
  if (fs.statSyncNoException(packageJsonPath)) {
    try {
      let packageJson = CSON.readFileSync(packageJsonPath);
      return packageJson.name === 'atom';
    } catch (e) {
      return false;
    }
  }

  return false;
}

const stableResourcePath = path.dirname(path.dirname(__dirname));
const start = require('./start');
start(stableResourcePath, stableResourcePath, startTime);
