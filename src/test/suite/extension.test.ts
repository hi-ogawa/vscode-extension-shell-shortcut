import * as vscode from "vscode";
import { EXT_ID } from "../../misc";
import { describe, test } from "mocha";

describe("extension.test", () => {
  test("activate", async () => {
    await vscode.extensions.getExtension(EXT_ID)!.activate();
  });
});
