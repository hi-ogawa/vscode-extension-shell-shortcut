import * as vscode from "vscode";
import { EXT_COMMAND } from "./misc";
import { executeShellCommand } from "./shell";
import { promptShellCommandSelection } from "./ui";

// ts-prune-ignore-next
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(EXT_COMMAND, (...args) =>
    runShellShortcut(context, ...args)
  );
  context.subscriptions.push(disposable);
}

async function runShellShortcut(
  context: vscode.ExtensionContext,
  inputUri?: vscode.Uri
): Promise<void> {
  // `sourceUri` argument is available only when the command is invoked via "editor/title" or "explorer/context" menu.
  // otherwise we look for an active uri from the editor
  inputUri ??= vscode.window.activeTextEditor?.document.uri;
  const fileName = inputUri?.fsPath;
  const lineNumber = vscode.window.activeTextEditor?.selection.active.line;

  // show UI to input/select shell command
  const selected = await promptShellCommandSelection(context);
  if (!selected) {
    vscode.window.showInformationMessage(
      "shell command selection is cancelled"
    );
    return;
  }

  // execute
  await executeShellCommand(selected, inputUri, fileName, lineNumber);
}
