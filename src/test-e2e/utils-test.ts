import { launchVscode } from "./utils";
import { test } from "vitest";
import npath from "node:path";

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
  app: async ({ __internal: { app } }, use) => {
    await use(app);
  },
  page: async ({ __internal: { page }, task }, use) => {
    // https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L59
    await page
      .context()
      .tracing.start({ title: task.name, screenshots: true, snapshots: true });
    await use(page);
    await page.context().tracing.stop({
      path: npath.resolve(
        `test-results`,
        [npath.basename(task.file?.filepath!), task.name, task.id]
          .filter(Boolean)
          .join("-")
          .replaceAll(/\W/g, "-"),
        "trace.zip",
      ),
    });
  },
});
