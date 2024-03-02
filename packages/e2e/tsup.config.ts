import { defineConfig } from "tsup";

export default [
  defineConfig({
    entry: ["src/proxy/server.ts"],
    format: ["cjs"],
    platform: "node",
    external: ["vscode"],
  }),
  defineConfig({
    entry: ["src/index.ts", "src/vitest.ts"],
    format: ["esm"],
    platform: "node",
  }),
];
