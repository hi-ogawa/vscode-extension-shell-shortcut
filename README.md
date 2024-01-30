# vscode-extension-shell-shortcut

This extension allows executing shell commands from the editor based on a currently opened file.
It can function as an alternative for various single-purpose extensions, e.g.

- https://github.com/euskadi31/vscode-json-pretty-printer
- https://github.com/hyeongyun0916/GZIP_Decompressor
- https://github.com/song-fangzhen/chromium-source-opener

See [`src/test/demo-workspace/.vscode/settings.json`](https://github.com/hi-ogawa/vscode-extension-shell-shortcut/blob/master/src/test/demo-workspace/.vscode/settings.json) for a sample configuration.

<details><summary>Show Demo</summary>

[Screencast](https://github.com/hi-ogawa/vscode-extension-shell-shortcut/assets/4232207/0e81d4f9-ac1f-49e9-8281-46d789384e52)

</details>

## development

```sh
pnpm i
pnpm dev
pnpm lint
pnpm test
cp -r .vscode-example/. .vscode  # then hit F5 to open src/test/demo-workspace

# publish dist/package/shell-shortcut-x.x.x.vsix to marketplace
# https://code.visualstudio.com/api/working-with-extensions/publishing-extension
pnpm build
```
