import * as path from "path";
import * as vscode from "vscode";
import { ConverterConfig } from "../../common";

const DEV_ROOT = path.resolve(__dirname, "../../..");

const DEMO_WORKSPACE = path.resolve(DEV_ROOT, "./src/test/demo-workspace");

export const DEMO_WORKSPACE_URI = vscode.Uri.file(DEMO_WORKSPACE);

export const CONVERTER_JQ: ConverterConfig = {
  name: "jq",
  command: "jq -M",
};

export const CONVERTER_GUNZIP: ConverterConfig = {
  name: "gunzip",
  command: "gunzip -c -",
};
