import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src/test-e2e",
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: process.env.CI ? 60_000 : Infinity,
    env: {
      CODE_VERSION: "1.86.2",
      TEST_RESOURCES: process.cwd() + "/node_modules/.cache/extest",
    },
  },
});
