import { launch } from "./utils";
import { test, type TestAPI } from "vitest";
import nodePath from "node:path";
import type { ElectronApplication, Page } from "playwright";
import type { ExecuteVscode } from "./proxy/client";
import fs from "node:fs";
import os from "node:os";

// based on
// https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L59

const defaultConfig = process.env as {
  VSCODE_E2E_DOWNLOAD_PATH?: string;
  VSCODE_E2E_EXTENSION_PATH?: string;
  VSCODE_E2E_WORKSPACE_PATH?: string;
  VSCODE_E2E_TRACE?: "on" | "off";
};

type VscodeTestFixture = {
  launch: (options?: {
    extensionPath?: string;
    workspacePath?: string;
    trace?: "on" | "off";
  }) => Promise<{
    app: ElectronApplication;
    execute: ExecuteVscode;
    page: Page;
  }>;
};

export const vscodeTest: TestAPI<VscodeTestFixture> =
  test.extend<VscodeTestFixture>({
    launch: async ({ task }, use) => {
      const teardowns: (() => Promise<void>)[] = [];

      await use(async (options) => {
        const tempDir = await fs.promises.mkdtemp(
          nodePath.join(os.tmpdir(), "vscode-e2e-"),
        );

        // launch
        const { app, execute } = await launch({
          vscodePath: defaultConfig.VSCODE_E2E_DOWNLOAD_PATH,
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
