import * as vscode from "vscode";
import {
  formatCommand,
  runCommand,
  showCommandContentAsUntitled,
} from "./shell";
import { promptShellCommandSelection } from "./ui";
import { EXT_COMMAND } from "./utils";

// ts-prune-ignore-next
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(EXT_COMMAND, (...args) =>
    runShellShortcut(context, ...args)
  );
  context.subscriptions.push(disposable);
}

async function runShellShortcut(
  context: vscode.ExtensionContext,
  sourceUri?: vscode.Uri
): Promise<void> {
  // `sourceUri` argument is available only when the command is invoked via "editor/title" or "explorer/context" menu.
  // otherwise we look for an active uri from the editor
  sourceUri ??= vscode.window.activeTextEditor?.document.uri;

  // show UI to input/select shell command
  const selected = await promptShellCommandSelection(context);
  if (!selected) {
    vscode.window.showInformationMessage(
      "shell command selection is cancelled"
    );
    return;
  }

  // open document with custom uri
  const fileName = vscode.window.activeTextEditor?.document.fileName;
  const line = vscode.window.activeTextEditor?.selection.active.line;
  const command = formatCommand(selected.command, fileName, line);
  await runCommand(command, Buffer.from(""));
  if (true as any) return;

  if (!sourceUri) {
    vscode.window.showErrorMessage("no active editor");
    return;
  }
  await showCommandContentAsUntitled(sourceUri, selected);
}
