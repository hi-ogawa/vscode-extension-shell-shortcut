import { launchVscode } from "./utils";

/*
Usage:

$ pnpm test-e2e-repl
await workbench.openWorkspaceFile("ex00.json")
await workbench.getTextEditor().getText()
await browser.quit()
*/

async function main() {
  const { browser, workbench } = await launchVscode({
    workspacePath: process.env["REPL_WORKSPACE"] || "src/test/demo-workspace",
  });
  Object.assign(globalThis, { browser, workbench });
}

main();
