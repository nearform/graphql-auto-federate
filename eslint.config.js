const js = require('@eslint/js')
const globals = require('globals')
const prettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = [
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }]
    }
  }
]
