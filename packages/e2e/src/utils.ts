import { download } from "@vscode/test-electron";
import { _electron } from "playwright";
import { VscodeProxyClient } from "./proxy/client";
import { sleep, tinyassert } from "@hiogawa/utils";
import nodeUrl from "node:url";
import nodeHttp from "node:http";

// TODO:
// --extensions-dir
// --user-data-dir

// TODO: can we get stdout/stderr log from electorn binary?

export async function launch(options: {
  vscodePath?: string;
  extensionPath?: string;
  workspacePath?: string;
  args?: (args: string[]) => void;
}) {
  // download by default (silence log?)
  const executablePath = options.vscodePath ?? (await download());

  // launch args
  const extensionDevelopmentPath = options.extensionPath
    ? nodeUrl.pathToFileURL(options.extensionPath)
    : new URL("../misc/empty-extension", import.meta.url);
  const vscodeProxyPath = new URL("./server.cjs", import.meta.url);
  const args = [
    // cf. https://github.com/microsoft/playwright-vscode/blob/1c2f766a3ef4b7633fb19103a3d930ebe385250e/tests-integration/tests/baseTest.ts#L41
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-updates",
    "--skip-welcome",
    "--skip-release-notes",
    "--disable-workspace-trust",
    `--extensionDevelopmentPath=${extensionDevelopmentPath}`,
    `--extensionTestsPath=${vscodeProxyPath}`,
  ];
  if (options.workspacePath) {
    args.push(`--folder-uri=${nodeUrl.pathToFileURL(options.workspacePath)}`);
  }
  options.args?.(args);

  // find port for vscode proxy
  const proxyPort = await findAvailablePort();

  // launch app
  const app = await _electron.launch({
    executablePath: executablePath,
    args,
    env: {
      ...(process.env as any),
      VSCODE_E2E_PROXY_PORT: proxyPort,
    },
  });

  // setup vscode proxy
  const proxyClient = new VscodeProxyClient(proxyPort);
  waitFor(() => proxyClient.execute(() => true));

  return { app, execute: proxyClient.execute };
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

// based on https://github.com/sindresorhus/get-port/blob/85c18678143f2c673bdaf5307971397b29ddf28b/index.js#L42
async function findAvailablePort(): Promise<number> {
  const server = nodeHttp.createServer().unref();
  const address = await new Promise<ReturnType<typeof server.address>>(
    (resolve, reject) => {
      server.on("error", (e) => {
        reject(e);
      });
      server.listen(() => {
        const address = server.address();
        server.close(() => {
          resolve(address);
        });
      });
    },
  );
  tinyassert(address && typeof address === "object");
  return address.port;
}
