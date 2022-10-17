const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const rules = require('./webpack.rules');
const { webpackExternals } = require('./incompatible-packages');

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  {
    test: /\.less$/i,
    use: [
      // compiles Less to CSS
      "style-loader",
      "css-loader",
      "less-loader",
    ],
  },
  {
    test: /\.m?js$/,
    use: {
      loader: 'babel-loader',
      options: {
        retainLines: true,
        presets: [
          [
            'babel-preset-atomic',
            {
              targets: {
                electron: "12.2.3",
              },
              keepModules: false,
              notStrictDirectiveTriggers: ['use babel'],
              notStrictCommentTriggers: ['@babel', '@flow', '* @babel', '* @flow'],
            },
          ],
        ],
        plugins: [
          "babel-plugin-relay",
        ],
      },
    },
  },
  {
    test: /\.(png|woff)$/i,
    type: 'asset/resource',
  },
);

module.exports = {
  // Put your normal webpack config below here
  devServer: {
    inline: true,
  },
  module: {
    rules,
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
  },
  externals: webpackExternals,
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee", ".less", ".cson", ".node"],
    modules: [path.resolve(__dirname, 'exports'), 'node_modules'],
  },
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "static/icons", to: "icons" },
        { from: "static/core-ui", to: "core-ui" },
        { from: "static/atom-ui", to: "atom-ui" },
        { from: "static/images", to: "images" },
      ],
    }),
  ]
};
