import { expect, test, vi } from "vitest";
import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import type { CodeRequest, CodeResponse } from "./vscode-proxy-impl";
import { tinyassert } from "@hiogawa/utils";

// TODO:
// - vitest fixture

test("basic", async () => {
  const vscodePath = await download();
  const extensionPath = new URL("../..", import.meta.url);
  const workspacePath = new URL("./src/test/demo-workspace", extensionPath);
  const vscodeProxyPath = new URL("./vscode-proxy.cjs", import.meta.url);
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
      `--extensionTestsPath=${vscodeProxyPath}`,
    ],
  });
  // wait until vscode proxy server is ready
  await vi.waitFor(() => execute(() => true), {
    interval: 500,
    timeout: 10000,
  });

  const page = await app.firstWindow();

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

  await app.close();
});

async function execute<T>(
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
