import * as vscode from "vscode";
import { type ShellCommandConfig, loadExtensionConfig, EXT_ID } from "./misc";
import { createManualPromise } from "@hiogawa/utils";

const QUICK_PICK_ITEM_INTERNAL = `${EXT_ID}:QUICK_PICK_ITEM_INTERNAL`;
const STATE_CUSTOM_COMMAND_HISTORY = "custom-command-history-v1";
const STATE_CUSTOM_COMMAND_HISTORY_MAX_ENTRIES = 20;

export async function promptShellCommandSelection(
  context: vscode.ExtensionContext,
): Promise<ShellCommandConfig | undefined> {
  const mainConfig = loadExtensionConfig();

  let selected: ConverterPickItem | undefined;
  let interaction: ConverterPickInteraction = createQuickPickInteraction(
    mainConfig.commands,
    context,
  );
  while (true) {
    selected = await interaction();
    if (!selected) {
      return;
    }
    const { continueInteraction } = selected[QUICK_PICK_ITEM_INTERNAL];
    if (continueInteraction) {
      interaction = continueInteraction;
      continue;
    }
    break;
  }
  return selected[QUICK_PICK_ITEM_INTERNAL].converterConfig;
}

function createQuickPickInteraction(
  converterConfigs: ShellCommandConfig[],
  context: vscode.ExtensionContext,
): ConverterPickInteraction {
  return function () {
    const customCommandInteraction = createCustomCommandInteraction(context);
    // When no configuration, show directly custom command input
    if (converterConfigs.length == 0) {
      return customCommandInteraction();
    }

    // Items directory from configuration
    const items: ConverterPickItem[] = converterConfigs.map((c) => ({
      label: c.name,
      [QUICK_PICK_ITEM_INTERNAL]: {
        converterConfig: c,
      },
    }));

    // Add entry for custom command input
    items.push({
      label: "custom command >",
      [QUICK_PICK_ITEM_INTERNAL]: {
        converterConfig: { name: "", command: "" },
        continueInteraction: customCommandInteraction,
      },
    });

    return vscode.window.showQuickPick(items);
  };
}

async function showQuickPickInput<T extends vscode.QuickPickItem>(
  items: T[],
  options: { placeholder: string; valueToItem: (value: string) => T },
): Promise<T | undefined> {
  const promise = createManualPromise<T | undefined>();
  const ui = vscode.window.createQuickPick<T>();
  ui.placeholder = options.placeholder;
  ui.items = items;

  // need to disable `sortByLabel` (proposed api) to avoid flickering when manipulating first entry
  // https://github.com/microsoft/vscode/pull/77297
  (ui as any).sortByLabel = false;

  ui.onDidChangeValue((value) => {
    if (value) {
      ui.items = [
        // prepending a first entry to simulate "auto suggest" input box
        // https://github.com/microsoft/vscode/issues/89601
        { ...options.valueToItem(value), alwaysShow: true },
        ...items,
      ];
    } else {
      ui.items = items;
    }
  });
  ui.onDidAccept(() => {
    promise.resolve(ui.selectedItems[0]);
  });
  ui.onDidHide(() => {
    promise.resolve(undefined);
    ui.dispose();
  });
  ui.show();
  return promise;
}

type ConverterPickInteraction = () => Thenable<ConverterPickItem | undefined>;

interface ConverterPickItem extends vscode.QuickPickItem {
  label: string;
  [QUICK_PICK_ITEM_INTERNAL]: {
    converterConfig: ShellCommandConfig;
    continueInteraction?: ConverterPickInteraction;
  };
}

function createCustomCommandInteraction(
  context: vscode.ExtensionContext,
): ConverterPickInteraction {
  // TODO:
  //   We cannot have an option to remove item from history since `IQuickPickItem.buttons` https://github.com/microsoft/vscode/blob/ff8f37a79626ede0265788192c406c95131dd7c5/src/vs/base/parts/quickinput/common/quickInput.ts#L39
  //   used in `workbench.action.openRecent` is not available for extension.
  //   For now, we only keep fixed number of most recently used commands.

  // Get custom command history
  const commandHistory = context.globalState.get<string[]>(
    STATE_CUSTOM_COMMAND_HISTORY,
    [],
  );

  return async function (): Promise<ConverterPickItem | undefined> {
    const items: ConverterPickItem[] = commandHistory.map((command) => ({
      label: command,
      [QUICK_PICK_ITEM_INTERNAL]: {
        converterConfig: {
          name: "",
          command,
        },
      },
    }));
    const result: ConverterPickItem | undefined = await showQuickPickInput(
      items,
      {
        placeholder: "Input command (e.g. grep hello -)",
        valueToItem: (value: string) => ({
          label: value,
          [QUICK_PICK_ITEM_INTERNAL]: {
            converterConfig: {
              name: "",
              command: value,
            },
          },
        }),
      },
    );
    if (!result) {
      return;
    }

    // select pipe mode
    const resultPipeMode = await promptPipeModeSelection();
    Object.assign(
      result[QUICK_PICK_ITEM_INTERNAL].converterConfig,
      resultPipeMode,
    );

    // update custom command history
    const { command } = result[QUICK_PICK_ITEM_INTERNAL].converterConfig;
    const index = commandHistory.indexOf(command);
    if (index != -1) {
      commandHistory.splice(index, 1);
    }
    commandHistory.unshift(command);
    await context.globalState.update(
      STATE_CUSTOM_COMMAND_HISTORY,
      commandHistory.slice(0, STATE_CUSTOM_COMMAND_HISTORY_MAX_ENTRIES),
    );
    return result;
  };
}

//
// promptPipeModeSelection
//

type PIPE_MODE = "NONE" | "IN" | "OUT" | "IN_OUT";

interface PipeModePickItem extends vscode.QuickPickItem {
  pipeMode: PIPE_MODE;
}

const PIPE_MODE_PICK_ITEMS: PipeModePickItem[] = [
  {
    label: "input and output",
    pipeMode: "IN_OUT",
  },
  {
    label: "input only",
    pipeMode: "IN",
  },
  {
    label: "output only",
    pipeMode: "OUT",
  },
  {
    label: "none",
    pipeMode: "NONE",
  },
];

async function promptPipeModeSelection(): Promise<{
  pipeInput: boolean;
  pipeOutput: boolean;
}> {
  // TODO: handle cancel
  const result = await vscode.window.showQuickPick(PIPE_MODE_PICK_ITEMS, {
    placeHolder: "Select pipe mode",
  });
  let pipeInput = false;
  let pipeOutput = false;
  if (result?.pipeMode === "IN") {
    pipeInput = true;
  }
  if (result?.pipeMode === "OUT") {
    pipeOutput = true;
  }
  if (result?.pipeMode === "IN_OUT") {
    pipeInput = true;
    pipeOutput = true;
  }
  return { pipeInput, pipeOutput };
}
