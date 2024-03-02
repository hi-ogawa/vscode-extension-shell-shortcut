import { launchVscode } from "./utils";
import { test } from "vitest";

type VscodeTestFixture = {
  __internal: Awaited<ReturnType<typeof launchVscode>>;
  app: VscodeTestFixture["__internal"]["app"];
  page: VscodeTestFixture["__internal"]["page"];
};

export const vscodeTest = test.extend<VscodeTestFixture>({
  __internal: async ({}, use) => {
    const result = await launchVscode({
      // TODO: fixture option?
      workspacePath: "./src/test/demo-workspace",
    });
    await use(result);
    await result.app.close();
  },
  app: async ({ __internal }, use) => {
    await use(__internal.app);
  },
  page: async ({ __internal }, use) => {
    await use(__internal.page);
  },
});
