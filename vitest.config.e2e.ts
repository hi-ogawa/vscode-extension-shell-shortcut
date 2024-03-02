import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src/test-e2e",
    // Infinity on local for `page.pause()`
    testTimeout: process.env.CI ? 60_000 : Infinity,
  },
});
