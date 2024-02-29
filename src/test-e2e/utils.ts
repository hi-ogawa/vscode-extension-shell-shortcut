import { sleep } from "@hiogawa/utils";
import nodePath from "node:path";
import {
  ExTester,
  InputBox,
  ReleaseQuality,
  TextEditor,
  VSBrowser,
  VSCODE_VERSION_MAX,
  Workbench,
} from "vscode-extension-tester";

// add a few helpers to improve Workbench API
class WorkbenchExtra extends Workbench {
  getTextEditor = () => new TextEditor();

  getInputBox = () => new InputBox();

  openWorkspaceFile = async (filename: string) => {
    let input = await this.openCommandPrompt();
    await input.setText(filename);
    await input.confirm();
  };

  pause = () => sleep(1000_000);
}

export async function launchVscode(options: { workspacePath?: string }) {
  const browser = new VSBrowser(VSCODE_VERSION_MAX, ReleaseQuality.Stable);
  // [PATCH] customArgs for vscode-extension-tester
  const customArgs = [
    "--skip-welcome",
    "--disable-updates",
    "--skip-release-notes",
    "--disable-workspace-trust",
  ];
  if (options.workspacePath) {
    customArgs.push(
      `--folder-uri=file:${nodePath.resolve(options.workspacePath)}`,
    );
  }
  await browser.start((new ExTester() as any).code.executablePath, customArgs);
  await browser.waitForWorkbench();
  const workbench = new WorkbenchExtra();
  return { browser, workbench };
}
