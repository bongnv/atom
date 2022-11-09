const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const webpackDir = path.resolve(__dirname, '.webpack');
const commonConfig = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-source-map' : 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.wasm', '.node', '.ts', '.tsx'],
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader',
      },
      {
        resourceQuery: /raw/,
        type: 'asset/resource',
      },
    ],
  },
  externals: ['atom', nodeExternals()],
  externalsType: 'commonjs',
  externalsPresets: {
    node: true,
    electron: true,
  },
  output: {
    path: path.resolve(__dirname, '.webpack'),
    library: {
      type: 'commonjs2',
    },
    assetModuleFilename: '[name][ext]',
  },
  plugins: [
    new webpack.DefinePlugin({
      TASK_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../task/main.js')`,
      ROOT_DIR: `require('path').resolve(__dirname, '../..')`,
      WINDOW_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../renderer/index.html')`,
      PRELOAD_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../preload/main.js')`,
    }),
  ],
  optimization: {
    minimize: false,
  },
};

module.exports = [
  // main
  merge(commonConfig, {
    name: 'main',
    entry: './src/main-process/main.js',
    target: 'electron-main',
    externalsPresets: {
      electronMain: true,
    },
    output: {
      filename: 'index.js',
      path: path.join(webpackDir, 'main'),
    },
    dependencies: ['preload', 'renderer', 'task'],
  }),
  // tasks
  merge(commonConfig, {
    name: 'task',
    entry: './src/task/task-bootstrap.js',
    target: 'electron-preload',
    externalsPresets: {
      electronPreload: true,
    },
    output: {
      path: path.join(webpackDir, 'task'),
    },
  }),
  // preload
  merge(commonConfig, {
    name: 'preload',
    entry: './src/preload/main.js',
    target: 'electron-preload',
    externalsPresets: {
      electronPreload: true,
    },
    output: {
      path: path.join(webpackDir, 'preload'),
    },
  }),
  // renderer
  merge(commonConfig, {
    name: 'renderer',
    entry: './src/renderer/index.ts',
    target: 'electron-renderer',
    externalsPresets: {
      electronRenderer: true,
    },
    output: {
      path: path.join(webpackDir, 'renderer'),
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: true,
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html',
      }),
      new CopyPlugin({
        patterns: [{ from: 'static' }],
      }),
    ],
  }),
];
