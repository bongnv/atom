module.exports = {
  retainLines: true,
  sourceMaps: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          electron: '13',
        },
        modules: 'commonjs',
      },
    ],
    '@babel/preset-react',
  ],
  plugins: ['babel-plugin-relay', 'babel-plugin-add-module-exports'],
  sourceType: 'unambiguous',
};
