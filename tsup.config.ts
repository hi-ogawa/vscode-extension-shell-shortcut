import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  platform: "node",
  external: ["vscode"],
});
