const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const rules = require('./webpack.rules');

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
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        retainLines: true,
        sourceMaps: true,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                electron: "12.2.3",
              },
              modules: "commonjs",
            },
          ],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
        plugins: [
          "babel-plugin-relay",
          // TODO: bongnv - remove the need of this plugin some day
          "babel-plugin-add-module-exports",
        ],
        sourceType: "unambiguous",
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
  module: {
    rules,
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
  },
  externals: [
    'atom',
    nodeExternals(),
  ],
  externalsType: 'commonjs',
  externalsPresets: {
    node: true,
    electron: true,
    electronPreload: true,
    electronRenderer: true,
  },
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee", ".less", ".node"],
  },
  devtool: 'source-map',
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
