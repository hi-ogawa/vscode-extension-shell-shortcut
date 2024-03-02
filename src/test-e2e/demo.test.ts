import { expect, test, vi } from "vitest";
import type { CodeRequest, CodeResponse } from "./vscode-proxy-impl";
import { tinyassert } from "@hiogawa/utils";
import { launchVscode } from "./utils";

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

async function executeVscode<T>(
  f: (vscode: typeof import("vscode")) => T,
): Promise<Awaited<T>> {
  const res = await fetch("http://localhost:8989", {
    method: "POST",
    body: JSON.stringify({ code: f.toString() } satisfies CodeRequest),
  });
  tinyassert(res.ok);
  const resJson: CodeResponse = await res.json();
  return resJson.result as any;
}
