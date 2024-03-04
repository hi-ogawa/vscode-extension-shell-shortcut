import { launch } from "./utils";
import { test, type TestAPI } from "vitest";
import nodePath from "node:path";
import type { ElectronApplication, Page } from "playwright";
import type { ExecuteVscode } from "./proxy/client";
import fs from "node:fs";
import os from "node:os";

export type VscodeTestFixture = {
  _launch: Awaited<ReturnType<typeof launch>>;
  app: ElectronApplication;
  execute: ExecuteVscode;
  page: Page;
};

export interface VscodeTestTaskMeta {
  vscodeExtensionPath?: string;
  vscodeWorkspacePath?: string;
  vscodeTrace?: "on" | "off";
}

declare module "vitest" {
  interface TaskMeta extends VscodeTestTaskMeta {}
}

const defaultConfig = process.env as {
  VSCODE_E2E_EXTENSION_PATH?: string;
  VSCODE_E2E_WORKSPACE_PATH?: string;
  VSCODE_E2E_TRACE?: "on" | "off";
};

type VscodeTestFixture2 = {
  open: (options?: {
    extensionPath?: string;
    workspacePath?: string;
    trace?: "on" | "off";
  }) => Promise<{
    app: ElectronApplication;
    execute: ExecuteVscode;
    page: Page;
  }>;
};

export const vscodeTestV2: TestAPI<VscodeTestFixture2> =
  test.extend<VscodeTestFixture2>({
    open: async ({ task }, use) => {
      const teardowns: (() => Promise<void>)[] = [];

      await use(async (options) => {
        const tempDir = await fs.promises.mkdtemp(
          nodePath.join(os.tmpdir(), "vscode-e2e-"),
        );

        // launch
        const { app, execute } = await launch({
          extensionPath: defaultConfig.VSCODE_E2E_EXTENSION_PATH,
          workspacePath: defaultConfig.VSCODE_E2E_WORKSPACE_PATH,
          args: (args) => {
            args.push(
              `--extensions-dir=${nodePath.join(tempDir, "extensions")}`,
              `--user-data-dir=${nodePath.join(tempDir, "user-data")}`,
            );
          },
          ...options,
        });
        const page = await app.firstWindow();

        // setup trace
        const trace = options?.trace ?? defaultConfig.VSCODE_E2E_TRACE;
        if (trace === "on") {
          await page.context().tracing.start({
            title: task.name,
            screenshots: true,
            snapshots: true,
          });
        }

        // define teardown
        teardowns.push(async () => {
          if (trace === "on") {
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
          await app.close();
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        });
        return { app, execute, page };
      });

      for (const teardown of teardowns) {
        await teardown();
      }
    },
  });

// cf. https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L59
export const vscodeTest: TestAPI<VscodeTestFixture> =
  test.extend<VscodeTestFixture>({
    _launch: async ({ task }, use) => {
      const _launch = await launch({
        extensionPath: task.meta.vscodeExtensionPath,
        workspacePath: task.meta.vscodeWorkspacePath,
      });
      await use(_launch);
      await _launch.app.close();
    },
    app: async ({ _launch: { app } }, use) => {
      await use(app);
    },
    execute: async ({ _launch: { execute } }, use) => {
      await use(execute);
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
