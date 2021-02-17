module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    camelcase: 'off',
  },
  extends: [
    'oclif',
    'oclif-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
}
