import { executeVscode } from "./proxy/client";
import { launchVscodeTest } from "./utils";

async function main() {
  const app = await launchVscodeTest({
    extensionPath: process.cwd(),
    workspacePath: process.env["REPL_WORKSPACE"] || "./src/test/demo-workspace",
  });
  const page = await app.firstWindow();
  Object.assign(globalThis, { app, page, executeVscode });
  await page.pause();
}

main();
