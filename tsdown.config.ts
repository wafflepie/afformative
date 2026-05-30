import { defineConfig } from "tsdown"

export default defineConfig({
  exports: true,
  format: ["esm", "cjs"],
  platform: "browser",
  sourcemap: true,
  target: "es2023",
})
