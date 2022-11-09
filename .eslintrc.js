module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      configFile: './babel.config.js',
    },
  },
  globals: {
    atom: true,
    ROOT_DIR: 'readonly',
    PRELOAD_WEBPACK_ENTRY: 'readonly',
    TASK_WEBPACK_ENTRY: 'readonly',
    WINDOW_WEBPACK_ENTRY: 'readonly',
  },
  rules: {
    'standard/no-callback-literal': ['off'],
    'node/no-deprecated-api': ['off'],
    'prettier/prettier': ['error'],
    'no-constant-condition': [
      'error',
      {
        checkLoops: false,
      },
    ],
  },
  overrides: [
    {
      files: ['spec/**', '**-spec.js', '**.test.js'],
      env: {
        jasmine: true,
      },
      globals: {
        advanceClock: true,
        fakeClearInterval: true,
        fakeSetInterval: true,
        waitsForPromise: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
    {
      files: ['src/task/*.js'],
      globals: {
        emit: true,
      },
    },
  ],
};
