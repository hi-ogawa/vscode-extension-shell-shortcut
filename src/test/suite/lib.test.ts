import * as assert from "assert";
import * as vscode from "vscode";
import { EXT_ID, ShellCommandConfig } from "../../misc";
import { CONVERTER_GUNZIP, CONVERTER_JQ, DEMO_WORKSPACE_URI } from "./misc";

// TODO: fix test

suite.skip("lib.test", () => {
  setup(async () => {
    await vscode.extensions.getExtension(EXT_ID)!.activate();
  });

  // testShow(showCommandContentAsUntitled);
});

type Show = (
  sourceUri: vscode.Uri,
  converterConfig: ShellCommandConfig
) => Promise<vscode.TextEditor>;

// @ts-expect-error
function testShow(show: Show): void {
  suite(show.name, () => {
    test("jq", async () => {
      // Demo json file
      const uri = vscode.Uri.joinPath(DEMO_WORKSPACE_URI, "ex00.json");

      // Prettify json
      const editor = await show(uri, CONVERTER_JQ);
      const expected = `\
{
  "hey": 1,
  "hello": [
    [
      false
    ]
  ]
}
`;
      assert.equal(editor.document.getText(), expected);
    });

    test("gunzip", async () => {
      // Demo gz file
      const uri = vscode.Uri.joinPath(DEMO_WORKSPACE_URI, "ex01.json.gz");

      // Decompress gzip
      const editor = await show(uri, CONVERTER_GUNZIP);
      const expected = `\
{ "hey": 1,
  "hello"  : [  [false]] }
`;
      assert.equal(editor.document.getText(), expected);
    });

    test("virtual-file-system", async () => {
      // Write json in "untitled" file system
      const content = `\
{ "hey": 1,
  "hello"  : [  [false]] }
`;
      const document = await vscode.workspace.openTextDocument({ content });

      // Prettify json
      const editor = await show(document.uri, CONVERTER_JQ);
      const expected = `\
{
  "hey": 1,
  "hello": [
    [
      false
    ]
  ]
}
`;
      assert.equal(editor.document.getText(), expected);
    });
  });
}
