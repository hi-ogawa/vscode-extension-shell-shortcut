import * as vscode from "vscode";

export const EXT_ID = "hi-ogawa.vscode-extension-shell-shortcut";
export const EXT_COMMAND = "extension.shell-shortcut.run";
const EXT_CONFIGURATION = "hi-ogawa.shell-shortcut";

// TODO: Accept `exec` options via `ConverterConfig`
export const EXEC_MAX_BUFFER = 1 << 29; // 512MB

// TODO: rename to CommandConfig
export interface ConverterConfig {
  name: string;
  command: string;
}

interface MainConfig {
  commands: ConverterConfig[];
}

const DEFAULT_MAIN_CONFIG: MainConfig = {
  commands: [],
};

// TODO: use zod to check runtime
export function getMainConfig(): MainConfig {
  const mainConfig = { ...DEFAULT_MAIN_CONFIG };
  for (const key_ in mainConfig) {
    const key = key_ as keyof MainConfig;
    mainConfig[key] = vscode.workspace
      .getConfiguration()
      .get(`${EXT_CONFIGURATION}.${key}`, mainConfig[key]) as any;
  }
  return mainConfig;
}
