import { launchVscode, executeVscode } from "@hiogawa/vscode-e2e";

async function main() {
  const app = await launchVscode({
    extensionPath: "./",
    workspacePath: process.env["REPL_WORKSPACE"] || "./src/test/demo-workspace",
  });
  const page = await app.firstWindow();
  Object.assign(globalThis, { app, page, executeVscode });
  await page.pause();
}

main();
