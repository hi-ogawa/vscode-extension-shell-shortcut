import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";

async function main() {
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
  const page = await app.firstWindow();
  Object.assign(globalThis, { app, page });
  await page.pause();
}

main();
