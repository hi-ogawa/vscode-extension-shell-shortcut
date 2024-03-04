import { expect, vi } from "vitest";
import { vscodeTest } from "@hiogawa/vscode-e2e/vitest";

vscodeTest("demo", async ({ launch }) => {
  const { page, execute } = await launch({
    workspacePath: "./src/test/demo-workspace",
  });

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
    execute((vscode) => vscode.window.activeTextEditor?.document.getText()),
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
