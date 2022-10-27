const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development"

const webpackDir = path.resolve(__dirname, '.webpack');
const commonConfig = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'source-map' : 'inline-source-map',
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee", ".node", '.ts', '.tsx'],
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.coffee$/,
        loader: "coffee-loader",
      },
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
  externals: [
    'atom',
    nodeExternals(),
  ],
  externalsType: 'commonjs',
  externalsPresets: {
    node: true,
    electron: true,
  },
  output: {
    path: path.resolve(__dirname, ".webpack"),
    library: {
      type: 'commonjs2',
    },
    assetModuleFilename: '[name][ext]',
  },
  plugins: [
    new webpack.DefinePlugin({
      TASK_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../task/main.js')`,
      ROOT_DIR: `require('path').resolve(__dirname, '../..')`,
      WINDOW_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../renderer/index.html')`
    }),
  ],
  optimization: {
    minimize: false,
  },
}

module.exports = [
  // main
  merge(commonConfig, {
    entry: './src/main-process/main.js',
    target: 'electron-main',
    externalsPresets: {
      electronMain: true,
    },
    output: {
      filename: 'index.js',
      path: path.join(webpackDir, 'main'),
    },
  }),
  // tasks
  merge(commonConfig, {
    entry: './src/task/task-bootstrap.js',
    target: 'electron-preload',
    externalsPresets: {
      electronPreload: true,
    },
    output: {
      path: path.join(webpackDir, 'task'),
    },
  }),
  // renderer
  merge(commonConfig, {
    entry: './src/renderer/index.js',
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
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
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
                      electron: "12",
                    },
                    modules: "commonjs",
                  },
                ],
                '@babel/preset-react',
              ],
              plugins: [
                "babel-plugin-relay",
                "babel-plugin-add-module-exports",
              ],
              sourceType: "unambiguous",
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
        patterns: [
          { from: "static" },
        ],
      }),
    ]
  }),
];
