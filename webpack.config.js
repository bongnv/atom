const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const webpackDir = path.resolve(__dirname, ".webpack");
const commonConfig = {
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.wasm', ".coffee", ".node"],
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        resourceQuery: /raw/,
        type: 'asset/resource',
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.coffee$/,
        loader: "coffee-loader",
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
  },
  plugins: [
    new webpack.DefinePlugin({
      PRELOAD_WEBPACK_ENTRY: `require('path').resolve(__dirname, '../preload/main.js')`,
      TASK_WEBPACK_DIR: `require('path').resolve(__dirname, '../task')`,
      ROOT_DIR: `require('path').resolve(__dirname, '../..')`,
    }),
  ],
  optimization: {
    minimize: false,
  },
}

module.exports = [
  // main
  {
    ...commonConfig,
    entry: './src/main-process/main.js',
    target: 'electron-main',
    externalsPresets: {
      ...commonConfig.externalsPresets,
      electronMain: true,
    },
    output: {
      ...commonConfig.output,
      filename: 'index.js',
      path: path.join(webpackDir, 'main'),
    },
  },
  // tasks
  {
    ...commonConfig,
    entry: {
      'task-bootstrap': './src/task/task-bootstrap.js',
      'scan-handler': './src/task/scan-handler.coffee',
      'replace-handler': './src/task/replace-handler.coffee',
    },
    target: 'electron-preload',
    externalsPresets: {
      ...commonConfig.externalsPresets,
      electronPreload: true,
    },
    output: {
      ...commonConfig.output,
      path: path.join(webpackDir, 'task'),
    },
  },
  // preload
  {
    ...commonConfig,
    entry: './src/preload/index.js',
    target: 'electron-preload',
    externalsPresets: {
      ...commonConfig.externalsPresets,
      electronPreload: true,
    },
    output: {
      ...commonConfig.output,
      path: path.join(webpackDir, 'preload'),
    },
    module: {
      ...commonConfig.module,
      rules: [
        ...commonConfig.module.rules,
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
  },
];