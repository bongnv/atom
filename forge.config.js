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
        "/docs/",
        "script/",
        "packages",
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
