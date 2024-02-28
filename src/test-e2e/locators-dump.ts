import { createRequire } from "node:module";
import path from "node:path";

// npx tsx src/test-e2e/locators-dump.ts

const require = createRequire(import.meta.url);

async function main() {
  const utilsPath = path.join(require.resolve("wdio-vscode-service"), "../utils.js");
  const utils = await import(utilsPath);
  const locators = await utils.getLocators("insiders");
  console.log(locators);
}

main();
