import { type ProxyRequest, type ProxyResponse } from "./shared";
import type * as VscodeType from "vscode";

export class VscodeProxyClient {
  constructor(private port: number) {}

  execute = async <T>(f: (vscode: typeof VscodeType) => T) => {
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
