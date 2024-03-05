import { defineConfig } from "vitest/config";
import { download } from "@vscode/test-electron";

export default defineConfig({
  test: {
    dir: "./src/test-e2e",
    // Infinity on local for `page.pause()`
    testTimeout: process.env.CI ? 60_000 : Infinity,
    // it works but it's too heavy to run in parallel?
    fileParallelism: false,
    env: {
      VSCODE_E2E_DOWNLOAD_PATH: await download(),
      VSCODE_E2E_EXTENSION_PATH: "./",
      VSCODE_E2E_TRACE: "on",
    },
  },
});
