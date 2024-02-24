import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "src/test/suite/**/*.test.ts",
  mocha: {
    preload: "./src/test/preload.cjs",
  },
});
