import * as vscode from "vscode";
import { EXT_ID } from "../../misc";
import { COMMAND_GUNZIP, COMMAND_JQ, DEMO_WORKSPACE_URI } from "./misc";
import { describe, test, before } from "mocha";
import { assert } from "chai";
import { executeShellCommand } from "../../shell";

describe(executeShellCommand.name, () => {
  before(async () => {
    const extension = vscode.extensions.getExtension(EXT_ID);
    assert(extension);
    await extension.activate();
  });

  test("jq", async () => {
    const uri = vscode.Uri.joinPath(DEMO_WORKSPACE_URI, "ex00.json");
    await executeShellCommand(COMMAND_JQ, uri);
    const editor = vscode.window.activeTextEditor;
    assert(editor);
    assert.equal(
      editor.document.getText(),
      `\
{
  "hey": 1,
  "hello": [
    [
      false
    ]
  ]
}
`,
    );
  });

  test("gunzip", async () => {
    const uri = vscode.Uri.joinPath(DEMO_WORKSPACE_URI, "ex01.json.gz");
    await executeShellCommand(COMMAND_GUNZIP, uri);
    const editor = vscode.window.activeTextEditor;
    assert(editor);
    assert.equal(
      editor.document.getText(),
      `\
{ "hey": 1,
  "hello"  : [  [false]] }
`,
    );
  });

  test("untitled", async () => {
    // write json in "untitled" file
    const content = `\
{ "hey": 1,
  "hello"  : [  [false]] }
`;
    const document = await vscode.workspace.openTextDocument({ content });

    // run jq
    await executeShellCommand(COMMAND_JQ, document.uri);
    const editor = vscode.window.activeTextEditor;
    assert(editor);
    assert.equal(
      editor.document.getText(),
      `\
{
  "hey": 1,
  "hello": [
    [
      false
    ]
  ]
}
`,
    );
  });
});
