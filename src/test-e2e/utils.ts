import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import { executeVscode } from "./proxy/client";

export async function launchVscode(options: { workspacePath: string }) {
  const vscodePath = await download();
  const extensionPath = new URL("../..", import.meta.url);
  const workspacePath = new URL(options.workspacePath, extensionPath);
  const vscodeProxyPath = new URL(
    "./proxy/server-wrapper.cjs",
    import.meta.url,
  );
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
  return { app, page, executeVscode };
}
