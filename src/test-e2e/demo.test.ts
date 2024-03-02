import { expect, test, vi } from "vitest";
import { launchVscode } from "./utils";
import { executeVscode } from "./proxy/client";

test("demo", async () => {
  const { app, page } = await launchVscode({
    workspacePath: "./src/test/demo-workspace",
  });

  // wait for vscode proxy server
  await vi.waitFor(() => executeVscode(() => true), {
    interval: 500,
    timeout: 10000,
  });

  // open ex00.json
  await page.getByLabel("ex00.json", { exact: true }).locator("a").click();

  // open command prompt
  await page.keyboard.press("Control+Shift+P");

  // run shell command extension
  await page
    .getByPlaceholder("Type the name of a command to")
    .fill(">run shel");
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

  await app.close();
});
