import { defineConfig } from "tsup";

// export default [
//   defineConfig({
//     entry: {
//       "client/worker-entry": "src/client/worker-entry.ts",
//       "client/vite-node": "src/client/vite-node.ts",
//     },
//     platform: "node",
//     external: ["vscode"]
//   }),
// ]

export default defineConfig({
  entry: ["src/extension.ts"],
  platform: "node",
  external: ["vscode"],
  sourcemap: "inline",
});
