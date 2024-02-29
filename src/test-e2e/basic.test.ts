import { expect, test } from "vitest";
import { launchVscode } from "./utils";

// const vsTest = test.extend<{ browser: VSBrowser }>({
//   browser: async ({}, use) => {
//     const browser = new VSBrowser(
//       VSCODE_VERSION_MAX,
//       ReleaseQuality.Stable,
//     );
//     await browser.start((new ExTester() as any).code.executablePath);
//     await browser.waitForWorkbench();
//     await use(browser)
//     await browser.quit();
//   }
// })

// vsTest("basic", async ({ browser }) => {
//   await pause();
//   // vs.openResources;
//   // // vs
//   // await pause();
//   // vs.driver;

//   // vs.driver;
//   // const browser = new VSBrowser(
//   //   VSCODE_VERSION_MAX,
//   //   ReleaseQuality.Stable,
//   // );
//   // await browser.start((new ExTester() as any).code.executablePath);
//   // await browser.waitForWorkbench();
//   // browser.openResources(new URL("../").toString())
//   // await browser.quit();
// });

test("basic", async () => {
  const { browser, workbench } = await launchVscode({
    openPaths: ["src/test/demo-workspace"],
  });

  // open ex00.json
  let input = await workbench.openCommandPrompt();
  await input.setText("ex00.json");
  await input.confirm();

  // run jq
  input = await workbench.openCommandPrompt();
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
