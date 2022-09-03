import * as vscode from "vscode";
import { z } from "zod";

export const EXT_ID = "hi-ogawa.shell-shortcut";
export const EXT_COMMAND = `${EXT_ID}.run`;

// TODO: Accept `exec` options via `ConverterConfig`
export const EXEC_MAX_BUFFER = 1 << 29; // 512MB

const CONVER_CONFIG_SCHEMA = z.object({
  name: z.string(),
  command: z.string(),
  pipeInput: z.boolean().optional(),
  pipeOutput: z.boolean().optional(),
});

const EXTENSION_CONFIG_SCHEMA = z.object({
  commands: z.array(CONVER_CONFIG_SCHEMA).default([]),
});

// TODO: rename to CommandConfig
export type ConverterConfig = z.infer<typeof CONVER_CONFIG_SCHEMA>;

type ExtensionConfig = z.infer<typeof EXTENSION_CONFIG_SCHEMA>;

const DEFAULT_EXTENSION_CONFIG: ExtensionConfig = {
  commands: [],
};

export function loadExtensionConfig(): ExtensionConfig {
  const raw = vscode.workspace.getConfiguration().get(EXT_ID, {});
  const parsed = EXTENSION_CONFIG_SCHEMA.safeParse(raw);
  if (!parsed.success) {
    vscode.window.showWarningMessage("failed to load config");
    return DEFAULT_EXTENSION_CONFIG;
  }
  return parsed.data;
}
