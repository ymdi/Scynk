module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    // parser: 'babel-eslint'
    ecmaVersion: true,
    parser: "@typescript-eslint/parser",
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-console': 'off'
  }
}
