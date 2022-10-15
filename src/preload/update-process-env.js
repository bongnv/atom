const fs = require('fs');
const childProcess = require('child_process');
const { ipcRenderer } = require('electron');

const ENVIRONMENT_VARIABLES_TO_PRESERVE = new Set([
  'NODE_ENV',
  'NODE_PATH',
  'ATOM_HOME',
  'ATOM_DISABLE_SHELLING_OUT_FOR_ENVIRONMENT'
]);

const PLATFORMS_KNOWN_TO_WORK = new Set(['darwin', 'linux']);

// Shell command that returns env var=value lines separated by \0s so that
// newlines are handled properly. Note: need to use %c to inject the \0s
// to work with some non GNU awks.
const ENV_COMMAND =
  'command awk \'BEGIN{for(v in ENVIRON) printf("%s=%s%c", v, ENVIRON[v], 0)}\'';

async function updateProcessEnv(launchEnv) {
  let envToAssign;
  if (launchEnv) {
    if (shouldGetEnvFromShell(launchEnv)) {
      envToAssign = await ipcRenderer.invoke('getEnvFromShell');
    } else if (launchEnv.PWD || launchEnv.PROMPT || launchEnv.PSModulePath) {
      envToAssign = launchEnv;
    }
  }

  if (envToAssign) {
    for (let key in process.env) {
      if (!ENVIRONMENT_VARIABLES_TO_PRESERVE.has(key)) {
        delete process.env[key];
      }
    }

    for (let key in envToAssign) {
      if (
        !ENVIRONMENT_VARIABLES_TO_PRESERVE.has(key) ||
        (!process.env[key] && envToAssign[key])
      ) {
        process.env[key] = envToAssign[key];
      }
    }

    if (envToAssign.ATOM_HOME && fs.existsSync(envToAssign.ATOM_HOME)) {
      process.env.ATOM_HOME = envToAssign.ATOM_HOME;
    }
  }
}

function shouldGetEnvFromShell(env) {
  if (!PLATFORMS_KNOWN_TO_WORK.has(process.platform)) {
    return false;
  }

  if (!env || !env.SHELL || env.SHELL.trim() === '') {
    return false;
  }

  const disableSellingOut =
    env.ATOM_DISABLE_SHELLING_OUT_FOR_ENVIRONMENT ||
    process.env.ATOM_DISABLE_SHELLING_OUT_FOR_ENVIRONMENT;

  if (disableSellingOut === 'true') {
    return false;
  }

  return true;
}

module.exports = { updateProcessEnv, shouldGetEnvFromShell };
