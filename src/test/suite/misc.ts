import * as path from "path";
import * as vscode from "vscode";
import { type ShellCommandConfig } from "../../misc";

const DEV_ROOT = path.resolve(__dirname, "../../..");

const DEMO_WORKSPACE = path.resolve(DEV_ROOT, "./src/test/demo-workspace");

export const DEMO_WORKSPACE_URI = vscode.Uri.file(DEMO_WORKSPACE);

export const COMMAND_JQ: ShellCommandConfig = {
  name: "jq",
  command: "jq -M",
  pipeInput: true,
  pipeOutput: true,
};

export const COMMAND_GUNZIP: ShellCommandConfig = {
  name: "gunzip",
  command: "gunzip -c -",
  pipeInput: true,
  pipeOutput: true,
};
