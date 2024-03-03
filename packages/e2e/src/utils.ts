import { download } from "@vscode/test-electron";
import { _electron } from "playwright";
import { executeVscode } from "./proxy/client";
import { sleep } from "@hiogawa/utils";
import nodeUrl from "node:url";

export async function launchVscode(options: {
  extensionPath?: string;
  workspacePath?: string;
  disableVscodeProxy?: boolean;
  args?: (args: string[]) => void;
}) {
  const executablePath = await download(); // silence log? // TODO: optional
  const args = [
    // cf. https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L41
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-updates",
    "--skip-welcome",
    "--skip-release-notes",
    "--disable-workspace-trust",
  ];
  if (options.extensionPath) {
    args.push(`--extensionDevelopmentPath=${options.extensionPath}`);
  }
  if (options.workspacePath) {
    args.push(`--folder-uri=${nodeUrl.pathToFileURL(options.workspacePath)}`);
  }
  if (!options.disableVscodeProxy) {
    const vscodeProxyPath = new URL("./server.cjs", import.meta.url);
    args.push(`--extensionTestsPath=${vscodeProxyPath}`);
  }
  options.args?.(args);
  const app = await _electron.launch({
    executablePath: executablePath,
    args,
  });
  if (!options.disableVscodeProxy) {
    await waitFor(() => executeVscode(() => true));
  }
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
