import { expect, test } from "vitest";
import { launchVscode } from "./utils";

test("basic", async () => {
  const { browser, workbench } = await launchVscode({
    workspacePath: "src/test/demo-workspace",
  });

  // open ex00.json
  await workbench.openWorkspaceFile("ex00.json");

  // run jq
  const input = await workbench.openCommandPrompt();
  await input.setText(">run shell command");
  await input.confirm();
  await input.selectQuickPick("json prettify");

  // check output
  let editor = workbench.getTextEditor();
  expect(await editor.getTitle()).toBe("ex00 (shell).json");
  expect(await editor.getText()).toMatchInlineSnapshot(`
    "{
      "hey": 1,
      "hello": [
        [
          false
        ]
      ]
    }
    "
  `);

  await browser.quit();
});
