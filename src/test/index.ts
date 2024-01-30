import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  await runTests({
    extensionDevelopmentPath: path.resolve(__dirname, "../.."),
    extensionTestsPath: path.resolve(__dirname, "run-wrapper.js"),
    // launchArgs: ["--disable-extensions"],
  });
}

main();
