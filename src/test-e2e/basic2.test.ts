import { test } from "vitest";
import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";

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
      `--folder-uri=${workspacePath}`,
      `--extensionDevelopmentPath=${extensionPath}`,
    ],
  });

  const page = await app.firstWindow();

  await page.getByLabel("ex00.json", { exact: true }).locator("a").click();
  await page.getByLabel("Files Explorer").press("CapsLock");
  await page.getByLabel("Files Explorer").press("Control+Shift+P");
  await page
    .getByPlaceholder("Type the name of a command to")
    .fill(">run shel");
  await page.getByPlaceholder("Type the name of a command to").press("Enter");
  await page.getByLabel("input").fill("json prettify");
  await page.getByLabel("input").press("Enter");

  await app.close();
});
