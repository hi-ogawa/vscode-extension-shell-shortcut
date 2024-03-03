import { download } from "@vscode/test-electron";
import { _electron } from "playwright";
import { executeVscode } from "./proxy/client";
import { sleep, tinyassert } from "@hiogawa/utils";
import nodeUrl from "node:url";
import nodeHttp from "node:http";

// TODO:
// --extensions-dir
// --user-data-dir

// TODO: can we get stdout/stderr log from electorn binary?

export async function launchVscode(options: {
  extensionPath?: string;
  workspacePath?: string;
  enableProxy?: boolean;
  args?: (args: string[]) => void;
}) {
  const executablePath = await download(); // silence log? // TODO: optional
  const extensionDevelopmentPath = options.extensionPath
    ? nodeUrl.pathToFileURL(options.extensionPath)
    : new URL("../misc/empty-extension", import.meta.url);
  const args = [
    // cf. https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L41
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-updates",
    "--skip-welcome",
    "--skip-release-notes",
    "--disable-workspace-trust",
    `--extensionDevelopmentPath=${extensionDevelopmentPath}`,
  ];
  if (options.workspacePath) {
    args.push(`--folder-uri=${nodeUrl.pathToFileURL(options.workspacePath)}`);
  }
  let env = { ...(process.env as any) };
  if (options.enableProxy) {
    const vscodeProxyPath = new URL("./server.cjs", import.meta.url);
    args.push(`--extensionTestsPath=${vscodeProxyPath}`);
    env["VSCODE_E2E_PROXY_PORT"] = await findAvailablePort();
  }
  options.args?.(args);
  const app = await _electron.launch({
    executablePath: executablePath,
    args,
    env,
  });
  if (options.enableProxy) {
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

async function findAvailablePort(): Promise<number> {
  const server = nodeHttp.createServer();
  return await new Promise((resolve, reject) => {
    server.on("error", (e) => {
      reject(e);
    });
    server.listen({}, () => {
      const address = server.address();
      tinyassert(address && typeof address === "object");
      server.close(() => {
        resolve(address.port);
      });
    });
  });
}
