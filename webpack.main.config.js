const path = require('path');

const { webpackExternals } = require('./incompatible-packages');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main-process/main.js',
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee"],
    modules: [path.resolve(__dirname, 'exports'), 'node_modules'],
  },
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  externals: webpackExternals,
  
};
