import Mocha from "mocha";
import { createManualPromise } from "@hiogawa/utils";
import fg from "fast-glob";

// https://github.com/microsoft/vscode-test/blob/bc400a29fbd3d54496bbcc7e9cbe5f687880471f/sample/src/test/suite/index.ts#L5-L6
type VscodeTestRun = (
  testsRoot: string,
  resultFn: (error: any, failures?: number) => void,
) => void;

export const run: VscodeTestRun = async (_testsRoot, resultFn) => {
  const mocha = new Mocha({
    color: true,
    timeout: 10000,
  });
  const files = await fg.glob(["suite/**/*.test.ts"], {
    cwd: __dirname,
    absolute: true,
  });
  for (const file of files) {
    mocha.addFile(file);
  }
  const promise = createManualPromise<void>();
  mocha.run((failures) => {
    resultFn(null, failures);
    promise.resolve();
  });
  await promise;
};
