import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(js.configs.recommended, tseslint.configs.recommended, {
  rules: {
    "no-console": [
      "error",
      {
        allow: ["warn", "error", "info"],
      },
    ],
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
  },
})
