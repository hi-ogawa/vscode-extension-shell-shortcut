import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import { executeVscode } from "./proxy/client";
import { sleep, tinyassert } from "@hiogawa/utils";

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
  await waitFor(() => executeVscode(() => true));
  return { app, page, executeVscode };
}

async function waitFor<T>(f: () => Promise<T>) {
  let ms = 100;
  let error: unknown;
  for (let i = 0; i < 10; i++) {
    if (i > 0) {
      await sleep((ms *= 2));
    }
    try {
      return await f();
    } catch (e) {
      error = e;
    }
  }
  throw error;
}
