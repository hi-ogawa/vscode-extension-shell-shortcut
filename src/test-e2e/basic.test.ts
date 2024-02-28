import { test } from "vitest";
import {
  VSBrowser,
  ReleaseQuality,
  VSCODE_VERSION_MAX,
  ExTester,
} from "vscode-extension-tester";

test("basic", async () => {
  const browser = new VSBrowser(
    VSCODE_VERSION_MAX,
    ReleaseQuality.Stable,
  );
  const extester = new ExTester();
  await browser.start((extester as any).code.executablePath);
  await browser.waitForWorkbench();
  await browser.quit();
});
