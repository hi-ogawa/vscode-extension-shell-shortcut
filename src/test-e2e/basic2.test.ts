import { test } from "vitest";
import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import { sleep } from "@hiogawa/utils";

test("basic", async () => {
  const vscodePath = await download();
  const extensionPath = new URL("../..", import.meta.url);
  const workspacePath = new URL("./src/test/demo-workspace", extensionPath);
  const app = await _electron.launch({
    executablePath: vscodePath,
    args: [
      "--no-sandbox",
      "--disable-gpu-sandbox",
      "--disable-updates",
      "--skip-welcome",
      "--skip-release-notes",
      "--disable-workspace-trust",
      `--extensionDevelopmentPath=${extensionPath}`,
      `--folderUri=${workspacePath}`,
    ],
  });

  const page = await app.firstWindow();
  await page.pause();
});
