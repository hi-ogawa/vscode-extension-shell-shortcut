# vscode-extension-shell-shortcut

This extension allows executing shell commands from the editor based on a currently opened file.
As a generalized alternative, it can replace various single-purpose extensions e.g.

- https://github.com/euskadi31/vscode-json-pretty-printer
- https://github.com/hyeongyun0916/GZIP_Decompressor
- https://github.com/song-fangzhen/chromium-source-opener

See [`src/test/demo-workspace/.vscode/settings.json`](https://github.com/hi-ogawa/vscode-extension-shell-shortcut/blob/master/src/test/demo-workspace/.vscode/settings.json) for the example configuration.

## development

```sh
pnpm i
pnpm dev
pnpm lint
pnpm test
cp -r .vscode-example/. .vscode  # then hit F5 to open src/test/demo-workspace

# publish to marketplace
volta install vsce  # install globally
pnpm package
```
