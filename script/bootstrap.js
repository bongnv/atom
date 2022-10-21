#!/usr/bin/env node

'use strict';

const CONFIG = require('./config');
const cleanDependencies = require('./lib/clean-dependencies');
const deleteMsbuildFromPath = require('./lib/delete-msbuild-from-path');
const dependenciesFingerprint = require('./lib/dependencies-fingerprint');
const installScriptRunnerDependencies = require('./lib/install-script-runner-dependencies');
const verifyMachineRequirements = require('./lib/verify-machine-requirements');

process.on('unhandledRejection', function (e) {
  console.error(e.stack || e);
  process.exit(1);
});

// We can't use yargs until installScriptDependencies() is executed, so...
let ci = process.argv.indexOf('--ci') !== -1;

if (
  !ci &&
  process.env.CI === 'true' &&
  process.argv.indexOf('--no-ci') === -1
) {
  console.log(
    'Automatically enabling --ci because CI is set in the environment'
  );
  ci = true;
}

verifyMachineRequirements(ci);

async function bootstrap() {
  if (dependenciesFingerprint.isOutdated()) {
    await cleanDependencies();
  }

  if (process.platform === 'win32') deleteMsbuildFromPath();

  installScriptRunnerDependencies();

  const {
    spawn,
    Thread,
    Worker,
  } = require(`${CONFIG.scriptRunnerModulesPath}/threads`);

  const installScriptDependencies = await spawn(
    new Worker('./lib/install-script-dependencies')
  );
  const installScriptDependenciesPromise = installScriptDependencies(ci);

  const installApm = await spawn(new Worker('./lib/install-apm'));
  await installApm(ci);
  await Thread.terminate(installApm);

  const runApmInstall = require('./lib/run-apm-install');
  runApmInstall(CONFIG.repositoryRootPath, ci);

  await installScriptDependenciesPromise;
  await Thread.terminate(installScriptDependencies);

  dependenciesFingerprint.write();
}

bootstrap()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    throw e;
  });
