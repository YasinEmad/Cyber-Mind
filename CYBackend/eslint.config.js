const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 12,
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
      },
    },
    rules: {
    },
  },
];
