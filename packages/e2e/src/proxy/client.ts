import { type ProxyRequest, type ProxyResponse } from "./shared";
import type * as VscodeType from "vscode";

export type ExecuteVscode = <T>(
  f: (vscode: typeof VscodeType) => T,
) => Promise<Awaited<T>>;

export class VscodeProxyClient {
  constructor(private port: number) {}

  execute: ExecuteVscode = async (f) => {
    const res = await fetch(`http://localhost:${this.port}`, {
      method: "POST",
      body: JSON.stringify({ fnString: f.toString() } satisfies ProxyRequest),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const resJson: ProxyResponse = await res.json();
    return resJson.result as any;
  };
}
