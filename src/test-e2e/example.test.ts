import { expect, beforeEach } from "vitest";
import { vscodeTest } from "@hiogawa/vscode-e2e/vitest";

beforeEach(({ task }) => {
  task.meta.vscodeTrace = "on";
  task.meta.vscodeProxy = true;
});

vscodeTest("example", async ({ page, execute }) => {
  // Open command pallete
  await page.keyboard.press("Control+Shift+P");

  // Run "New Untitled ..." command
  await page.getByPlaceholder("Type the name of a command to").fill(">untitle");
  await page
    .locator("div")
    .filter({ hasText: /^File: New Untitled Text File$/ })
    .nth(1)
    .click();

  // Check editor panel
  await page.getByText("Untitled-").click();
  await page.getByText("Select a language, or fill").click();

  // Write something
  await page.keyboard.type("hello\nworld");

  // Can access `vscode` API to write assertions which are difficult with `page` API
  expect(
    await execute((vscode) =>
      vscode.window.activeTextEditor?.document.getText(),
    ),
  ).toMatchInlineSnapshot(`
    "hello
    world"
  `);
});
