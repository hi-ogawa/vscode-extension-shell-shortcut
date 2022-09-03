import * as vscode from "vscode";
import { ShellCommandConfig, loadExtensionConfig } from "./utils";

const QUICK_PICK_ITEM_INTERNAL = "__HIROSHI_INTERNAL__"; // Symbol doesn't seem to work
const STATE_CUSTOM_COMMAND_HISTORY = "custom-command-history-v1";
const STATE_CUSTOM_COMMAND_HISTORY_MAX_ENTRIES = 20;

export async function promptShellCommandSelection(
  context: vscode.ExtensionContext
): Promise<ShellCommandConfig | undefined> {
  const mainConfig = loadExtensionConfig();

  let selected: ConverterPickItem | undefined;
  let interaction: ConverterPickInteraction = createQuickPickInteraction(
    mainConfig.commands,
    context
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
  context: vscode.ExtensionContext
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
      label: "(custom command)",
      [QUICK_PICK_ITEM_INTERNAL]: {
        converterConfig: { name: "", command: "" },
        continueInteraction: customCommandInteraction,
      },
    });

    return vscode.window.showQuickPick(items);
  };
}

// cf. https://github.com/microsoft/vscode/issues/89601#issuecomment-580133277
async function showQuickPickInput<T extends vscode.QuickPickItem>(
  items: T[],
  options: { placeholder: string; valueToItem: (value: string) => T }
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const ui = vscode.window.createQuickPick<T>();
    ui.placeholder = options.placeholder;
    ui.items = items;
    // TODO: Debounce input change
    ui.onDidChangeValue((value) => {
      let newItems = Array.from(items);
      if (value) {
        newItems.unshift({
          alwaysShow: true, // This helps reducing flickering of picker dropdown
          ...options.valueToItem(value),
        });
      }
      ui.items = newItems;
    });
    ui.onDidAccept(() => {
      resolve(ui.selectedItems[0]);
    });
    ui.onDidHide(() => {
      resolve(undefined);
      ui.dispose();
    });
    ui.show();
    return;
  });
}

type ConverterPickInteraction = () => Thenable<ConverterPickItem | undefined>;

interface ConverterPickItem extends vscode.QuickPickItem {
  label: string;
  [QUICK_PICK_ITEM_INTERNAL]: {
    converterConfig: ShellCommandConfig;
    continueInteraction?: ConverterPickInteraction;
  };
}

type PIPE_MODE = "NONE" | "IN" | "OUT" | "IN_OUT";

interface PipeModePickItem extends vscode.QuickPickItem {
  pipeMode: PIPE_MODE;
}

const PIPE_MODE_PICK_ITEMS: PipeModePickItem[] = [
  {
    label: "none",
    pipeMode: "NONE",
  },
  {
    label: "input only",
    pipeMode: "NONE",
  },
  {
    label: "output only",
    pipeMode: "NONE",
  },
  {
    label: "input and output",
    pipeMode: "NONE",
  },
];

function createCustomCommandInteraction(
  context: vscode.ExtensionContext
): ConverterPickInteraction {
  // TODO:
  //   We cannot have an option to remove item from history since `IQuickPickItem.buttons` https://github.com/microsoft/vscode/blob/ff8f37a79626ede0265788192c406c95131dd7c5/src/vs/base/parts/quickinput/common/quickInput.ts#L39
  //   used in `workbench.action.openRecent` is not available for extension.
  //   For now, we only keep fixed number of most recently used commands.

  // Get custom command history
  const commandHistory = context.globalState.get<string[]>(
    STATE_CUSTOM_COMMAND_HISTORY,
    []
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
    const result = await showQuickPickInput(items, {
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
    });
    if (result) {
      const resultPipeMode = await vscode.window.showQuickPick(
        PIPE_MODE_PICK_ITEMS,
        {
          placeHolder: "Select pipe mode",
        }
      );
      console.log(resultPipeMode);

      // Update custom command history
      const { command } = result[QUICK_PICK_ITEM_INTERNAL].converterConfig;
      const index = commandHistory.indexOf(command);
      if (index != -1) commandHistory.splice(index, 1);
      commandHistory.unshift(command);
      await context.globalState.update(
        STATE_CUSTOM_COMMAND_HISTORY,
        commandHistory.slice(0, STATE_CUSTOM_COMMAND_HISTORY_MAX_ENTRIES)
      );
    }
    return result;
  };
}
