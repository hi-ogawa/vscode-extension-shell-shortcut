import { download } from "@vscode/test-electron";
import { _electron } from "@playwright/test";
import { executeVscode } from "./proxy/client";
import { sleep, typedBoolean } from "@hiogawa/utils";
import nodeUrl from "node:url";

export async function launchVscodeTest(options: {
  extensionPath: string; // TODO: optional
  workspacePath?: string;
}) {
  const vscodePath = await download(); // silence log? // TODO: optional
  const vscodeProxyPath = new URL("./server.cjs", import.meta.url);
  const app = await _electron.launch({
    executablePath: vscodePath,
    // TODO: customize args
    args: [
      "--no-sandbox",
      "--disable-gpu-sandbox",
      "--disable-updates",
      "--skip-welcome",
      "--skip-release-notes",
      "--disable-workspace-trust",
      `--extensionDevelopmentPath=${options.extensionPath}`,
      `--extensionTestsPath=${vscodeProxyPath}`, // TODO: optional vscode proxy
      options.workspacePath &&
        `--folder-uri=${nodeUrl.pathToFileURL(options.workspacePath)}`,
    ].filter(typedBoolean),
  });
  await waitFor(() => executeVscode(() => true));
  return app;
}

async function waitFor<T>(f: () => Promise<T>) {
  let ms = 100;
  let error: unknown;
  for (let i = 0; i < 6; i++) {
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
