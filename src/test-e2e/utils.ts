import { sleep } from "@hiogawa/utils";
import {
  ExTester,
  InputBox,
  ReleaseQuality,
  TextEditor,
  VSBrowser,
  VSCODE_VERSION_MAX,
  Workbench,
} from "vscode-extension-tester";

class WorkbenchExtra extends Workbench {
  getTextEditor = () => new TextEditor();
  getInputBox = () => new InputBox();
}

export async function launchVscode({
  openPaths = [],
}: {
  openPaths: string[];
}) {
  const browser = new VSBrowser(VSCODE_VERSION_MAX, ReleaseQuality.Stable);
  await browser.start((new ExTester() as any).code.executablePath);
  // TODO: use --folderUri ?
  await browser.openResources(...openPaths);
  await browser.waitForWorkbench();
  const workbench = new WorkbenchExtra();
  return { browser, workbench };
}

export async function pause() {
  await sleep(1000_000);
}
