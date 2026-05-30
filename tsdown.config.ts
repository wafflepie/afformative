import { defineConfig } from "tsdown"

export default defineConfig({
  dts: true,
  exports: true,
  format: ["esm", "cjs"],
  platform: "neutral",
  sourcemap: true,
  target: "es2023",
})
