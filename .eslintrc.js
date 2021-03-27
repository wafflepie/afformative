module.exports = {
  parser: "@typescript-eslint/parser",
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
    },
  },
  rules: {
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: ["block", "block-like", "export", "import", "multiline-expression"],
        next: "*",
      },
      {
        blankLine: "always",
        prev: "*",
        next: ["block", "block-like", "export", "import", "return", "throw"],
      },
      {
        blankLine: "any",
        prev: ["export", "import"],
        next: ["export", "import"],
      },
      {
        blankLine: "never",
        prev: "case",
        next: "*",
      },
    ],
    // NOTE: Sadly, `sort-imports` is not really compatible with `import/order`.
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: {
          order: "asc",
          caseInsensitive: false,
        },
      },
    ],
    "no-console": [
      "error",
      {
        allow: ["warn", "error", "info"],
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["packages/**/*.test.{js,ts}", "packages/**/*.config.js", "*.config.js"],
      },
    ],
    "import/prefer-default-export": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
      },
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
}
