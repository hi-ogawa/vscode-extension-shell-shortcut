import * as vscode from "vscode";
import { EXT_ID } from "../../utils";

suite.skip("extension.test", () => {
  test("activate", async () => {
    await vscode.extensions.getExtension(EXT_ID)!.activate();
  });
});
