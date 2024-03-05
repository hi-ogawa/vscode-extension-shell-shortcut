# vscode-e2e

Using [Playwright Electron](https://playwright.dev/docs/api/class-electron)
for [VS Code Extension](https://code.visualstudio.com/api) E2E testing

## Usage

This package offers a custom [`Vitest fixture`](https://vitest.dev/guide/test-context.html#extend-test-context)
for simplified test setup in Vitest.

It also includes `execute` utility to enable direct access to
[`vscode` API](https://code.visualstudio.com/api/references/vscode-api)
from your test code.

```ts
import { expect } from "vitest";
import { vscodeTest } from "@hiogawa/vscode-e2e/vitest";

vscodeTest("example", async ({ launch }) => {
  const { page, execute } = await launch({
    extensionPath: "./",
    workspacePage: "./examples/basic",
    trace: "on",
  });

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
```

You can also configure default settings via `VSCODE_E2E_...` environment variables:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      VSCODE_E2E_EXTENSION_PATH: "./",
      VSCODE_E2E_WORKSPACE_PATH: "./examples/basic",
      VSCODE_E2E_TRACE: "on",
    },
  },
});
```

Like on Playwright, you can use [`page.pause()`](https://playwright.dev/docs/api/class-page#page-pause)
to open [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)
and record interactions and assertions.

![image](https://github.com/hi-ogawa/vscode-extension-shell-shortcut/assets/4232207/a508ddf1-4365-4743-8a59-73c62ca07c3d)

Outside of Vitest, you can use `launch` utility directly:

```ts
import { launch } from "@hiogawa/vscode-e2e";

const { app, execute } = await launch({
  extensionPath: "./",
  workspacePath: "./example/basic",
});
const page = await app.firstWindow();
await page.pause();
```

## Credits

Inspired by following projects

- https://github.com/microsoft/playwright-vscode/pull/353
- https://github.com/webdriverio-community/wdio-vscode-service/
- https://github.com/redhat-developer/vscode-extension-tester/
