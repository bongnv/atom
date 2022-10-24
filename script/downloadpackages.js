const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageJsonPath = path.resolve(__dirname, '../package.json');

const packageMetadata = require(packageJsonPath);
Object.keys(packageMetadata.packageDependencies).forEach((packageName) => {
    const dependencyInfo = packageMetadata.dependencies[packageName];
    if (!dependencyInfo) {
        console.log(`no info for ${packageName}`);
        return;
    }

    if (dependencyInfo.startsWith('file:')) {
        console.log(`Skipping ${packageName} because it's already downloaded`);
        return;
    }

    if (dependencyInfo.startsWith('github')) {
        console.log(`Download ${packageName} from ${dependencyInfo}`);
        const [, repoOwner, repo,, hash] = dependencyInfo.match(/github:(\w+)\/([\w\d-]+)(#([\w\d\.]+))?/)
        if (!hash) {
            hash = 'master'
        }
        console.log(`procesing`, repoOwner, repo, hash);
        spawnSync('git', ['clone', `git@github.com:${repoOwner}/${repo}.git`], {
            env: process.env,
            cwd: path.join(__dirname, '../packages'),
            stdio: 'inherit',
        });

        spawnSync('git', ['checkout', hash], {
            env: process.env,
            cwd: path.join(__dirname, '../packages', repo),
            stdio: 'inherit',
        });

        spawnSync('rm', ['-rf', '.git', '.github', 'package-lock.json', 'rollup.config.js', '.travis.yml', 'appveyor.yml'], {
            env: process.env,
            cwd: path.join(__dirname, '../packages', repo),
            stdio: 'inherit',
        });

        spawnSync('git', ['add', '.'], {
            env: process.env,
            cwd: path.join(__dirname, '../packages', repo),
            stdio: 'inherit',
        });

        packageMetadata.dependencies[packageName] = `file:packages/${repo}`;
    };
});

// write to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageMetadata, null, '  '));