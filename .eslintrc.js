module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ["airbnb", "airbnb/hooks", "prettier", "prettier/react"],
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
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": [
      "error",
      {
        allow: ["warn", "error", "info"],
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["packages/**/*.test.js", "packages/**/*.config.js", "*.config.js"],
      },
    ],
    "import/prefer-default-export": "off",
  },
}
