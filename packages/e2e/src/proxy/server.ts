import * as vscode from "vscode";
import http from "node:http";
import { createManualPromise, tinyassert } from "@hiogawa/utils";
import { type ProxyRequest, type ProxyResponse } from "./shared";

// (Ab)use --extensionTestsPath to setup http server to expose vscode API.
// The idea is same as wdio-vscode-service's websocket proxy:
// https://github.com/webdriverio-community/wdio-vscode-service/blob/99fd9a5c32ef540c7778dbca92ad1e7335207975/src/proxy/index.ts

export async function run() {
  const port = Number(process.env["VSCODE_E2E_PROXY_PORT"]);

  const server = http.createServer(async (req, res) => {
    try {
      await vscodeProxyHandler(req, res);
    } catch (e) {
      res.statusCode = 500;
      const message =
        e instanceof Error ? e.stack ?? e.message : "Internal Server Error";
      res.end(message);
    }
  });

  server.listen(port);

  // keep it running
  await new Promise(() => {});
}

async function vscodeProxyHandler(
  req: http.IncomingMessage,
  res: http.OutgoingMessage,
) {
  tinyassert(req.method === "POST", `invalid method: ${req.method}`);
  const reqBody = await readRequestBody(req);
  const reqJson: ProxyRequest = JSON.parse(reqBody);
  tinyassert(typeof reqJson.fnString === "string", `invalid body: ${reqJson}`);

  const f = (0, eval)(reqJson.fnString); // indirect eval
  tinyassert(typeof f === "function", `invalid code: ${reqJson.fnString}`);

  const result = await f(vscode);
  const resJson = { result } satisfies ProxyResponse;
  res.end(JSON.stringify(resJson, null, 2));
}

async function readRequestBody(req: http.IncomingMessage) {
  const promise = createManualPromise<void>();
  let result = "";
  req.on("data", (chunk) => {
    result += String(chunk);
  });
  req.on("error", (e) => {
    promise.reject(e);
  });
  req.on("end", () => {
    promise.resolve();
  });
  await promise;
  return result;
}
