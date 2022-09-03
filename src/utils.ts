import * as vscode from "vscode";
import { z } from "zod";

export const EXT_ID = "hi-ogawa.shell-shortcut";
export const EXT_COMMAND = `${EXT_ID}.run`;

//
// extension configuration
//

const SHELL_COMMAND_CONFIG_SCHEMA = z.object({
  name: z.string(),
  command: z.string(),
  pipeInput: z.boolean().optional(),
  pipeOutput: z.boolean().optional(),
});

const EXTENSION_CONFIG_SCHEMA = z.object({
  commands: z.array(SHELL_COMMAND_CONFIG_SCHEMA).default([]),
});

export type ShellCommandConfig = z.infer<typeof SHELL_COMMAND_CONFIG_SCHEMA>;

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

//
// misc
//

type Result<T, E> = { ok: true; value: T } | { ok: false; value: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(value: E): Result<never, E> {
  return { ok: false, value };
}

export async function wrapReject<T>(
  promise: Promise<T>
): Promise<Result<T, unknown>> {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(e);
  }
}

// ts-prune-ignore-next
export function wrapError<T>(f: () => T): Result<T, unknown> {
  try {
    const value = f();
    return Ok(value);
  } catch (e) {
    return Err(e);
  }
}
