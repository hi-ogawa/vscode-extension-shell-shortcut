import { expect, vi, beforeEach } from "vitest";
import { vscodeTest } from "@hiogawa/vscode-e2e/vitest";
import { executeVscode } from "@hiogawa/vscode-e2e";

beforeEach(({ task }) => {
  task.meta.vscodeExtensionPath = "./";
  task.meta.vscodeWorkspacePath = "./src/test/demo-workspace";
  task.meta.vscodeTrace = "on";
  task.meta.vscodeProxy = true;
});

vscodeTest("demo", async ({ page }) => {
  // open ex00.json
  await page.getByLabel("ex00.json", { exact: true }).locator("a").click();

  // open command prompt
  await page.keyboard.press("Control+Shift+P");

  // run shell command extension
  await page
    .getByPlaceholder("Type the name of a command to")
    .fill(">run shell");
  await page.getByPlaceholder("Type the name of a command to").press("Enter");
  await page.getByLabel("input").fill("json prettify");
  await page.getByLabel("input").press("Enter");

  // check output
  await page.getByText("ex00 (shell).json", { exact: true }).click();
  const text = await vi.waitUntil(async () =>
    executeVscode((vscode) =>
      vscode.window.activeTextEditor?.document.getText(),
    ),
  );
  expect(text).toMatchInlineSnapshot(`
    "{
      "hey": 1,
      "hello": [
        [
          false
        ]
      ]
    }
    "
  `);
});
