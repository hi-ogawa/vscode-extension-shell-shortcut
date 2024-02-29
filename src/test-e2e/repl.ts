import { launchVscode } from "./utils";

async function main() {
  const { browser, workbench } = await launchVscode({ openPaths: [] });
  Object.assign(globalThis, { browser, workbench });
}

main();
