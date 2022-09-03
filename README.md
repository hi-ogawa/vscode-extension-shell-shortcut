# vscode-extension-shell-shortcut

## development

```sh
pnpm i
npm run dev
npm run prettier
npm run test
cp -r .vscode-example/. .vscode  # then hit F5 to open src/test/demo-workspace

# publish to marketplace
volta install vsce
npm run tsc
# TODO: need to bundle by ourselves (just use esbuild)
vsce package --no-dependencies  # then upload to https://marketplace.visualstudio.com/manage/publishers/hi-ogawa
```

## misc

- fork of https://github.com/hi-ogawa/vscode-extension-pipe-to-untitled
