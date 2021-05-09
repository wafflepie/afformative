import path from "path"

import babelPlugin from "@rollup/plugin-babel"
import cjsPlugin from "@rollup/plugin-commonjs"
import nodeResolvePlugin from "@rollup/plugin-node-resolve"
import replacePlugin from "@rollup/plugin-replace"
import { split, compose, join, prepend, tail, map } from "ramda"
import { toPascalCase, toKebabCase } from "ramda-extension"
import autoExternalPlugin from "rollup-plugin-auto-external"
import { terser as terserPlugin } from "rollup-plugin-terser"

const { LERNA_ROOT_PATH, LERNA_PACKAGE_NAME } = process.env
const PACKAGE_ROOT_PATH = process.cwd()
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, "src/index.ts")

const extensions = [".js", ".ts"]

const plugins = {
  cjs: cjsPlugin({
    include: /node_modules/,
  }),
  terser: terserPlugin({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  }),
  nodeResolve: nodeResolvePlugin({
    extensions,
  }),

  // NOTE: We have no way of injecting the current output format into our Babel config file,
  // therefore we need to use two files. Brittle, but it works.
  babel: ({ useESModules }) =>
    babelPlugin({
      cwd: LERNA_ROOT_PATH,
      extensions,
      babelHelpers: "runtime",
      configFile: path.join(__dirname, useESModules ? "babel.config.esm.js" : "babel.config.js"),
    }),
}

const getGlobalName = compose(join(""), prepend("Afformative"), map(toPascalCase), tail, split("/"))
const getFileName = compose(join("-"), prepend("afformative"), map(toKebabCase), tail, split("/"))

const globalName = getGlobalName(LERNA_PACKAGE_NAME)
const fileName = getFileName(LERNA_PACKAGE_NAME)

export default [
  // NOTE: CJS
  {
    input: INPUT_FILE,
    output: {
      file: path.join(PACKAGE_ROOT_PATH, "dist", `${fileName}.cjs.js`),
      format: "cjs",
      indent: false,
    },
    external: [/@babel\/runtime/],
    plugins: [
      autoExternalPlugin(),
      plugins.nodeResolve,
      plugins.cjs,
      plugins.babel({ useESModules: false }),
    ],
  },

  // NOTE: ES
  {
    input: INPUT_FILE,
    output: {
      file: path.join(PACKAGE_ROOT_PATH, "dist", `${fileName}.esm.js`),
      format: "es",
      indent: false,
    },
    external: [/@babel\/runtime/],
    plugins: [
      autoExternalPlugin(),
      plugins.nodeResolve,
      plugins.cjs,
      plugins.babel({ useESModules: true }),
    ],
  },

  // NOTE: UMD Development
  {
    input: INPUT_FILE,
    output: {
      file: path.join(PACKAGE_ROOT_PATH, "dist", `${fileName}.umd.js`),
      format: "umd",
      name: globalName,
      indent: false,
    },
    plugins: [
      replacePlugin({
        "process.env.NODE_ENV": JSON.stringify("development"),
        preventAssignment: true,
      }),
      plugins.nodeResolve,
      plugins.cjs,
      plugins.babel({ useESModules: false }),
    ],
  },

  // NOTE: UMD Production
  {
    input: INPUT_FILE,
    output: {
      file: path.join(PACKAGE_ROOT_PATH, "dist", `${fileName}.umd.min.js`),
      format: "umd",
      name: globalName,
      indent: false,
    },
    plugins: [
      replacePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
      plugins.nodeResolve,
      plugins.cjs,
      plugins.babel({ useESModules: false }),
      plugins.terser,
    ],
  },
]
