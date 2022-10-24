const path = require('path');
const fs = require('fs');

const packagesDir = path.join(__dirname, '../packages');
fs.readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map((dirent) => {
    const packageJsonPath = path.join(packagesDir, dirent.name, 'package.json')
    const packageMetadata = require(packageJsonPath);
    let shouldUpdate = false;

    if (packageMetadata['scripts']) {
      if (packageMetadata['scripts']['prepare']) {
        console.log(`Deleted prepare script for ${packageJsonPath}`)
        delete packageMetadata['scripts']['prepare'];
        shouldUpdate = true;
      }

      if (packageMetadata['scripts']['build']) {
        console.log(`Deleted build script for ${packageJsonPath}`)
        delete packageMetadata['scripts']['build'];
        shouldUpdate = true;
      }
    }

    const mainScript = packageMetadata['main'];
    if (mainScript) {
      if (mainScript.startsWith('./dist/main')) {
        console.log(`Need to check ${dirent.name} manually`);
      } else if (mainScript.startsWith('lib/main') || mainScript.startsWith('./lib/main')) {
        console.log(`Skip updating ${dirent.name}`);
      } else {
        console.log(`Updating ${mainScript} for ${dirent.name}`);
        const newMainFile = path.join(packagesDir, dirent.name, 'lib', 'main.js');
        console.log(`Writing to ${newMainFile}`);
        if (fs.existsSync(newMainFile)) {
          console.log(`${newMainFile} already exists`);
        } else {
          packageMetadata['main'] = './lib/main.js';
          fs.writeFileSync(newMainFile, `module.exports = require('./${mainScript.substring(6, mainScript.length)}');`);
          shouldUpdate = true;
        }
      }
    }

    if (shouldUpdate) {
      console.log(`Updating ${packageJsonPath}`)
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageMetadata, null, '  '));
    }
  });
