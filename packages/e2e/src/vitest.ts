import { launchVscode } from "./utils";
import { test, type TestAPI } from "vitest";
import nodePath from "node:path";
import type { ElectronApplication, Page } from "@playwright/test";

export type VscodeTestFixture = {
  app: ElectronApplication;
  page: Page;
};

export interface VscodeTestTaskMeta {
  vscodeExtensionPath?: string;
  vscodeWorkspacePath?: string;
  vscodeTrace?: "on" | "off";
  vscodeProxy?: boolean;
}

declare module "vitest" {
  interface TaskMeta extends VscodeTestTaskMeta {}
}

// cf. https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L59
export const vscodeTest: TestAPI<VscodeTestFixture> =
  test.extend<VscodeTestFixture>({
    app: async ({ task }, use) => {
      const app = await launchVscode({
        extensionPath: task.meta.vscodeExtensionPath,
        workspacePath: task.meta.vscodeWorkspacePath,
        enableProxy: task.meta.vscodeProxy,
      });
      await use(app);
      await app.close();
    },
    page: async ({ app, task }, use) => {
      const page = await app.firstWindow();
      if (task.meta.vscodeTrace === "on") {
        await page.context().tracing.start({
          title: task.name,
          screenshots: true,
          snapshots: true,
        });
      }
      await use(page);
      if (task.meta.vscodeTrace === "on") {
        await page.context().tracing.stop({
          path: nodePath.resolve(
            "test-results",
            [nodePath.basename(task.file?.filepath!), task.name, task.id]
              .filter(Boolean)
              .join("-")
              .replaceAll(/\W/g, "-"),
            "trace.zip",
          ),
        });
      }
    },
  });
