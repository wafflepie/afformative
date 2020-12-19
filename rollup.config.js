import path from "path"

import { split, compose, join, prepend, tail, map } from "ramda"
import { toPascalCase, toKebabCase } from "ramda-extension"
import autoExternalPlugin from "rollup-plugin-auto-external"
import babelPlugin from "rollup-plugin-babel"
import cjsPlugin from "rollup-plugin-commonjs"
import nodeResolvePlugin from "rollup-plugin-node-resolve"
import replacePlugin from "rollup-plugin-replace"
import { terser as terserPlugin } from "rollup-plugin-terser"

const { LERNA_ROOT_PATH } = process.env

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
  babel: babelPlugin({
    cwd: LERNA_ROOT_PATH,
    extensions,
    runtimeHelpers: true,
  }),
}

const getGlobalName = compose(join(""), prepend("Afformative"), map(toPascalCase), tail, split("/"))

const getFileName = compose(join("-"), prepend("afformative"), map(toKebabCase), tail, split("/"))

const { LERNA_PACKAGE_NAME } = process.env
const PACKAGE_ROOT_PATH = process.cwd()
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, "src/index.ts")

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
    plugins: [autoExternalPlugin(), plugins.nodeResolve, plugins.babel, plugins.cjs],
  },

  // NOTE: ES
  {
    input: INPUT_FILE,
    output: {
      file: path.join(PACKAGE_ROOT_PATH, "dist", `${fileName}.esm.js`),
      format: "es",
      indent: false,
    },
    plugins: [autoExternalPlugin(), plugins.nodeResolve, plugins.babel, plugins.cjs],
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
      replacePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
      plugins.nodeResolve,
      plugins.babel,
      plugins.cjs,
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
      replacePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
      plugins.nodeResolve,
      plugins.babel,
      plugins.cjs,
      plugins.terser,
    ],
  },
]
