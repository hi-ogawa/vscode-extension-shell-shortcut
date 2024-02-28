import { download } from "@vscode/test-electron";
import { test as base } from "vitest";
import { _electron } from "@playwright/test";
import { sleep } from "@hiogawa/utils";

type VscodeType = typeof import("vscode");

// proxy
//   vscode instance
// just eval? require("vscode")
// eval
// window

type VscodePage = {};

type TestFixture = {
  page: {
    x: number;
  };
};

export const test = base.extend<TestFixture>({
  // page: async ({}, use) => {
  //   `const vscode = require("vscode")`;
  //   await use(0);
  // }
  page: {
    x: 0,
  },
});

export async function setupVscode() {
  const downloadPath = await download();
  const app = await _electron.launch({
    executablePath: downloadPath,
    args: [""],
  });
  //
  // `require("vscode")` electron main process?
  app.evaluateHandle;
  const page = await app.firstWindow();
  return { app, page };
}

test("basic", ({ page }) => {
  page;
});

export async function pause() {
  // TODO:
  await sleep(2 ** 30);
}
