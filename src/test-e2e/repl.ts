import { launchVscode } from "./utils";

async function main() {
  const { app, page } = await launchVscode({
    workspacePath: process.env["REPL_WORKSPACE"] || "./src/test/demo-workspace",
  });
  Object.assign(globalThis, { app, page });
  await page.pause();
}

main();
