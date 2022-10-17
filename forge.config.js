const path = require('path');
const { externals } = require('./external-packages');

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
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        devServer: {
          client: {
            logging: 'verbose',
          },
        },
        mainConfig: "./webpack.main.config.js",
        renderer: {
          nodeIntegration: true,
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./static/index.html",
              js: "./static/index.js",
              name: "main_window",
              preload:{
                js: "./src/preload/index.js"
              },
            },
          ]
        }
      }
    ],
    [
      "@timfish/forge-externals-plugin",
      {
        "externals": externals,
        "includeDeps": true
      }
    ]
  ]
}
