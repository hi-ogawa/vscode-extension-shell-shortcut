import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src/test-e2e",
    testTimeout: Infinity,
  },
});
