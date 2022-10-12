const path = require('path');

module.exports = {
    packagerConfig: {
      appBundleId: "com.github.atom",
      helperBundleId: 'com.github.atom.helper',
      icon: path.join(
        'resources',
        'app-icons',
        'dev',
        'atom'
      ),
      ignore: [
        /^\/script\//,
        /^\/docs\//,
        /^\/packages\//,
        /\/spec\//,
        /\/test\//,
        /\/\.github\//,
        /\/package-lock\.json$/,
        /\/.travis.yml$/i,
        /\/README\.md$/i,
        /\/LICENSE(\.md)?$/i,
        /\.Dockerfile$/i,
        /.*\/.ts$/i,
      ],
      derefSymlinks: true,
    },
    makers: [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "atom"
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ]
}
