import { PROXY_PORT, type ProxyRequest, type ProxyResponse } from "./shared";

export async function executeVscode<T>(
  f: (vscode: typeof import("vscode")) => T,
): Promise<Awaited<T>> {
  const res = await fetch(`http://localhost:${PROXY_PORT}`, {
    method: "POST",
    body: JSON.stringify({ fnString: f.toString() } satisfies ProxyRequest),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const resJson: ProxyResponse = await res.json();
  return resJson.result as any;
}
