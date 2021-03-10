module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    strict: 0,
    semi: 0,
    'no-undef': 2,
    quotes: 0,
    'prefer-template': 'error',
    eqeqeq: 2,
    camelcase: [0],
    'brace-style': 2,
    'callback-return': [2, ['callback', 'cb', 'next']],
    'no-debugger': 0,
    'no-console': 0,
  },
}
