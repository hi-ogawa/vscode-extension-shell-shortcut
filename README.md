# vscode-extension-shell-shortcut

This extension allows executing shell commands from the editor and aims to replace various "ad-hoc" extensions e.g.

- https://github.com/euskadi31/vscode-json-pretty-printer
- https://github.com/hyeongyun0916/GZIP_Decompressor
- https://github.com/song-fangzhen/chromium-source-opener

See [`src/test/demo-workspace/.vscode/settings.json`](https://github.com/hi-ogawa/vscode-extension-shell-shortcut/blob/master/src/test/demo-workspace/.vscode/settings.json) for the example configuration.

## development

```sh
pnpm i
npm run dev
npm run prettier
npm run test
cp -r .vscode-example/. .vscode  # then hit F5 to open src/test/demo-workspace

# publish to marketplace
volta install vsce  # install globally
npm run package
```
