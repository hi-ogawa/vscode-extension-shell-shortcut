import { ExecOptions, exec } from "child_process";
import * as path from "path";
import { Readable } from "stream";
import * as vscode from "vscode";
import { ShellCommandConfig } from "./utils";

// TODO: configurable?
const EXEC_MAX_BUFFER = 2 ** 29; // 512MB

export function formatCommand(
  command: string,
  fileName?: string,
  line?: number
): string {
  command = command.replace("${__file__}", fileName ?? "");
  command = command.replace("${__line__}", String(line ?? ""));
  return command;
}

export async function runCommand(
  command: string,
  stdin: Buffer
): Promise<{ stdout: string; stderr: string }> {
  const execOption: ExecOptions = {
    maxBuffer: EXEC_MAX_BUFFER,
  };
  return new Promise((resolve, reject) => {
    const proc = exec(command, execOption, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
    if (!proc.stdin) {
      reject(new Error("Unavailable stdin on spawned process"));
      return;
    }
    Readable.from(stdin).pipe(proc.stdin);
  });
}

async function uriToBuffer(uri: vscode.Uri): Promise<Buffer> {
  // Read Uri as Buffer
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

async function runConverter(
  sourceUri: vscode.Uri,
  converterConfig: ShellCommandConfig
): Promise<string | undefined> {
  // TODO: Show loading on status bar

  const { command } = converterConfig;
  const buffer = await uriToBuffer(sourceUri);

  // Execute command
  try {
    const { stdout, stderr } = await runCommand(command, buffer);
    if (stderr.length > 0) {
      let message = ["Converter stderr:", stderr].join("\n");
      vscode.window.showWarningMessage(message);
    }
    return stdout;
  } catch (e) {
    let message = "Converter command failed";
    if (e instanceof Error) {
      message += ": " + e.toString();
    }
    vscode.window.showErrorMessage(message);
  }
  return;
}

function formatPath(s: string): string {
  let { base, ...rest } = path.parse(s);
  if (base.includes(".")) {
    const [name, ...exts] = base.split(".");
    base = [`${name} (pipe untitled)`, ...exts].join(".");
  }
  return path.format({ base, ...rest });
}

// export for testing
export async function showCommandContentAsUntitled(
  sourceUri: vscode.Uri,
  converterConfig: ShellCommandConfig
): Promise<vscode.TextEditor> {
  const content = await runConverter(sourceUri, converterConfig);

  const uri = vscode.Uri.from({
    scheme: "untitled",
    path: formatPath(sourceUri.path), // TODO: Is it bad to have path name conflicts of "untitled" documents?
    query: JSON.stringify({ converterConfig }), // Use query to differenciate different commands with path
  });

  const document = await vscode.workspace.openTextDocument(uri);

  // TODO: Is streaming possible with this approach?
  const editor = await vscode.window.showTextDocument(document);
  new vscode.Range(0, 0, editor.document.lineCount, 0);
  await editor.edit((builder) => {
    builder.replace(
      new vscode.Range(0, 0, document.lineCount, 0),
      content ?? ""
    );
  });
  return editor;
}
