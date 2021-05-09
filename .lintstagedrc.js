module.exports = {
  "**/*.{js,ts}": ["prettier --ignore-path .gitignore --write", "yarn lint --fix"],
  "**/*.{mdx,md,html,json}": ["prettier --ignore-path .gitignore --write"],
}
