import { launch } from "@hiogawa/vscode-e2e";

async function main() {
  const { app, execute } = await launch({
    extensionPath: "./",
    workspacePath: process.env["REPL_WORKSPACE"] || "./src/test/demo-workspace",
    enableProxy: true,
  });
  const page = await app.firstWindow();
  Object.assign(globalThis, { app, page, execute });
  await page.pause();
}

main();
