const { reject } = require('async');
const path = require('path');
const webpack = require('webpack');
const { asyncOra } = require('@electron-forge/async-ora');

const webpackConfig = require('./webpack.config.js');

module.exports = {
  packagerConfig: {
    appBundleId: 'com.github.atom',
    helperBundleId: 'com.github.atom.helper',
    icon: path.join('resources', 'app-icons', 'dev', 'atom'),
    ignore: [
      /^\/exports\//,
      /^\/keymap\//,
      /^\/menus\//,
      /^\/script\//,
      /^\/src\//,
      /^\/vendor\//,
      /^\/webpack.*/,
      /\/\.github\//,
      /\/docs\//,
      /\/spec\//,
      /^\/packages\/[\d\w-]+\/(?!keymaps|menus|styles|package\.json|settings|grammars)/,
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
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'atom',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  hooks: {
    generateAssets: () => asyncOra('Compiling code', () => new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err);
          return;
        }
        resolve();
      });
    })),
  },
};
