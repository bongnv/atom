const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const { spawnSync } = require('child_process');

const rootPackageJsonPath = path.resolve(__dirname, '../package.json');
const rootPackageMetadata = require(rootPackageJsonPath);

const main = async () => {
  let needUpdate = false;
  const toDeletePackages = [];

  const allPackages = (
    await fs.readdir(path.resolve(__dirname, '../packages'), {
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const packageName of allPackages) {
    if (!rootPackageMetadata.dependencies[packageName]) {
      console.log(`Skip ${packageName} because it isn't in package.json.`);
      continue;
    }

    const packageMetadata = require(path.join(
      __dirname,
      '../packages',
      packageName,
      'package.json'
    ));
    const dependencies = packageMetadata.dependencies
      ? Object.keys(packageMetadata.dependencies)
      : [];
    console.log(`Adding ${packageName} with ${dependencies}`);
    if (dependencies.length > 0) {
      spawnSync('npm', ['install', ...dependencies], {
        env: process.env,
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });
    }
    toDeletePackages.push(packageName);
    needUpdate = true;
  }

  if (needUpdate) {
    console.log(`Delete ${toDeletePackages} from package.json`);
    const newPackageJson = JSON.parse(await fs.readFile(rootPackageJsonPath));
    toDeletePackages.forEach(
      (name) => delete newPackageJson.dependencies[name]
    );
    await fs.writeFile(
      rootPackageJsonPath,
      JSON.stringify(newPackageJson, null, '  ')
    );
  }
};
main();
