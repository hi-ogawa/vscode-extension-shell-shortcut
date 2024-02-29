import { test } from "vitest";
import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import { sleep } from "@hiogawa/utils";
import path from "node:path";

// allow deep import by patches/wdio-vscode-service@6.0.3.patch
import { getLocators } from "wdio-vscode-service/dist/utils.js";

test("basic", async () => {
  const vscodePath = await download();
  console.log({ vscodePath });
  console.log(require.resolve("wdio-vscode-service"));
  console.log(path.join(require.resolve("wdio-vscode-service"), "../utils.js"));
  // guilty deep import...
  // const wdioVscodeUtils = await import(path.join(require.resolve("wdio-vscode-service"), "../utils.js"));
  // const wdioVscodeUtils = await import("wdio-vscode-service/dist/utils.js");

  const locators = await getLocators("insiders");
  console.log(locators);
  // console.log(wdioVscodeUtils);

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

  // `require("vscode")` electron main process?
  // const ret = await app.evaluateHandle(async () => {
  //   const vscode = require("vscode") as typeof import("vscode");
  //   console.log("app.vscode", vscode.version);
  //   return vscode.version
  // });
  // console.log({ ret });

  const page = await app.firstWindow();
  console.log(
    await page
      .locator(locators.Notification["message"] as string)
      .textContent(),
  );
  await app.close();
  // await pause();
});

export async function pause() {
  // TODO:
  await sleep(2 ** 30);
}
