'use strict';

const childProcess = require('child_process');
const path = require('path');

const CONFIG = require('../config');

function installApm(ci = false, showVersion = true) {
  if (ci) {
    // Tell apm not to dedupe its own dependencies during its
    // postinstall script. (Deduping during `npm ci` runs is broken.)
    process.env.NO_APM_DEDUPE = 'true';
  }
  console.log('Installing apm');
  childProcess.execFileSync(
    CONFIG.getLocalNpmBinPath(),
    ['--global-style', '--loglevel=error', ci ? 'ci' : 'install'],
    { env: process.env, cwd: CONFIG.apmRootPath }
  );
  
  const apmModulePath = path.join(CONFIG.apmRootPath, 'node_modules', 'atom-package-manager');
  childProcess.execFileSync(
    CONFIG.getLocalNpmBinPath(),
    ['run', 'rebuild:apm'],
    {
      env: process.env,
      cwd: apmModulePath,
    }
  );

  if (showVersion) {
    childProcess.execFileSync(CONFIG.getApmBinPath(), ['--version'], {
      stdio: 'inherit'
    });
  }
}

const { expose } = require(`${CONFIG.scriptRunnerModulesPath}/threads/worker`);
expose(installApm);
module.exports = installApm;
