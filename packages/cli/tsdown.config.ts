import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  outExtensions: () => ({ js: ".mjs" }),
  target: "node20",
  platform: "node",
  clean: true,
  dts: false,
  // @poise-ui/registry is a private workspace package, so the schema must be
  // bundled rather than left as an external import.
  deps: { alwaysBundle: ["@poise-ui/registry"] },
});
