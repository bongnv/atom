const path = require('path');

const { webpackExternals } = require('./external-packages');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    main: {
      import: './src/main-process/main.js',
      filename: 'main/index.js',
    },
    'task-bootstrap': {
      import: './src/task/task-bootstrap.js',
      filename: 'task/task-bootstrap.js',
    },
    'scan-handler': {
      import: './src/task/scan-handler.coffee',
      filename: 'task/scan-handler.js',
    },
    'replace-handler': {
      import: './src/task/replace-handler.coffee',
      filename: 'task/replace-handler.js',
    },
  },
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee"],
    modules: [path.resolve(__dirname, 'exports'), 'node_modules'],
  },
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  externals: webpackExternals,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, ".webpack"),
    libraryTarget: 'commonjs2',
  },
};
