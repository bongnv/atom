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
    ignore: [
      /^\/keymap\//,
      /^\/menus\//,
      /^\/script\//,
      /^\/src\//,
      /^\/vendor\//,
      /^\/webpack.*/,
      /\/\.github\//,
      /\/docs\//,
      /\/spec\//,
      /^\/packages\/[\d\w-]+\/(?!keymaps|menus|styles|package\.json)/,
      /\/package-lock\.json$/,
      /\/.travis.yml$/i,
      /\/README\.md$/i,
      /\/LICENSE(\.md)?$/i,
      /\.Dockerfile$/i,
      /.*\/.ts$/i,
    ],
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
  ]
}
