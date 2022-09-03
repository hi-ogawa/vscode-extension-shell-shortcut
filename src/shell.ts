import { ExecOptions, exec } from "child_process";
import * as path from "path";
import { Readable } from "stream";
import * as vscode from "vscode";
import { EXT_ID, ShellCommandConfig, wrapReject } from "./utils";

const FILE_NAME_PLACEHOLDER = "${__file__}";
const LINE_NUMBER_PLACEHOLDER = "${__line__}";

export async function executeShellCommand(
  shellCommandConfig: ShellCommandConfig,
  inputUri?: vscode.Uri,
  fileName?: string,
  lineNumber?: number
): Promise<void> {
  let { command, pipeInput, pipeOutput } = shellCommandConfig;

  //
  // read input from the uri
  //

  let input: Buffer | undefined = undefined;
  if (pipeInput) {
    if (!inputUri) {
      vscode.window.showErrorMessage(
        "cannot pipe input (no active document is found)"
      );
      return;
    }
    input = await uriToBuffer(inputUri);
  }

  //
  // format command (replace file/line placeholder)
  //

  if (command.includes(FILE_NAME_PLACEHOLDER)) {
    if (typeof fileName === "undefined") {
      vscode.window.showErrorMessage(
        "pipe input (no active document is found)"
      );
      return;
    }
    command = command.replace(FILE_NAME_PLACEHOLDER, fileName);
  }

  if (command.includes(LINE_NUMBER_PLACEHOLDER)) {
    if (typeof lineNumber === "undefined") {
      vscode.window.showErrorMessage(
        "cannot pipe input (no active document is found)"
      );
      return;
    }
    command = command.replace(LINE_NUMBER_PLACEHOLDER, String(lineNumber));
  }

  //
  // execute
  //

  const result = await wrapReject(runCommand(command, input));

  if (!result.ok) {
    let message = `shell command error`;
    if (result.value instanceof Error) {
      message += ": " + result.value.toString();
    }
    vscode.window.showErrorMessage(message);
    return;
  }

  const { stdout, stderr } = result.value;
  if (stderr) {
    vscode.window.showWarningMessage(`shell command stderr:\n${stderr}`);
  }

  //
  // output to untitled document
  //

  if (pipeOutput) {
    if (!stdout) {
      vscode.window.showWarningMessage(`no stdout`);
      return;
    }

    const uri = vscode.Uri.from({
      scheme: "untitled",
      path: formatPath(inputUri?.path ?? EXT_ID),
    });
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await editor.edit((builder) => {
      builder.replace(new vscode.Range(0, 0, document.lineCount, 0), stdout);
    });
  }
}

// TODO: configurable?
// TODO: timeout?
const EXEC_OPTIONS: ExecOptions = {
  maxBuffer: 2 ** 29, // 512MB,
};

async function runCommand(
  command: string,
  stdin?: Buffer
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, EXEC_OPTIONS, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
    if (stdin) {
      if (!proc.stdin) {
        reject(new Error("stdin not available for spawned process"));
        return;
      }
      Readable.from(stdin).pipe(proc.stdin);
    }
  });
}

async function uriToBuffer(uri: vscode.Uri): Promise<Buffer> {
  let buffer: Buffer;
  if (uri.scheme == "file") {
    const data = await vscode.workspace.fs.readFile(uri);
    buffer = Buffer.from(data);
  } else {
    // When URI is not backed by file system, read through TextDocument.getText
    const document = await vscode.workspace.openTextDocument(uri);
    buffer = Buffer.from(document.getText());
  }
  return buffer;
}

// TODO: implement following path patterns:
// - xxx.ext
// - xxx (shell).ext
// - xxx (shell (2)).ext
// - ...
function formatPath(s: string): string {
  let { base, ...rest } = path.parse(s);
  if (base.includes(".")) {
    const [name, ...exts] = base.split(".");
    base = [`${name} (shell)`, ...exts].join(".");
  }
  return path.format({ base, ...rest });
}
