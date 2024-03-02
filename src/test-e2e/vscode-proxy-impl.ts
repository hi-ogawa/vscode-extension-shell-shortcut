import * as vscode from "vscode";
import http from "node:http";
import { createManualPromise, tinyassert } from "@hiogawa/utils";

// (Ab)use --extensionTestsPath to setup http server to expose vscode API.
// The idea is same as wdio-vscode-service's websocket proxy:
// https://github.com/webdriverio-community/wdio-vscode-service/blob/99fd9a5c32ef540c7778dbca92ad1e7335207975/src/proxy/index.ts

// curl http://localhost:8989 -d '{ "code": "(vscode) => vscode.window.activeTextEditor.document.getText()" }'

export async function run() {
  const server = http.createServer(async (req, res) => {
    try {
      await vscodeProxyHandler(req, res);
    } catch (e) {
      res.statusCode = 500;
      res.end(
        e instanceof Error ? e.stack ?? e.message : "Internal Server Error",
      );
    }
  });

  // TODO: configurable port?
  server.listen(8989, () => {
    console.log(":: server started at http://localhost:8989");
  });

  // keep it running
  await new Promise(() => {});
}

export type CodeRequest = {
  code: string;
};

export type CodeResponse = {
  result: unknown;
};

// TODO: propagate error (tiny-rpc?)

async function vscodeProxyHandler(
  req: http.IncomingMessage,
  res: http.OutgoingMessage,
) {
  tinyassert(req.method === "POST", `invalid method: ${req.method}`);
  const reqBody = await readRequestBody(req);
  const reqJson: CodeRequest = JSON.parse(reqBody);
  tinyassert(typeof reqJson.code === "string", `invalid body: ${reqJson}`);

  const f = eval(reqJson.code);
  tinyassert(typeof f === "function", `invalid code: ${reqJson.code}`);

  const result = await f(vscode);
  const resJson = { result } satisfies CodeResponse;
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
