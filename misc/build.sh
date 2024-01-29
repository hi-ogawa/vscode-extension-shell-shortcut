#!/bin/bash
set -eu -o pipefail

dest_dir=dist/package

# copy to clean directory for vsce
rm -rf "$dest_dir"
mkdir -p "$dest_dir/dist/esbuild"
cp package.json README.md LICENSE.txt "$dest_dir"
cp dist/esbuild/extension.js "$dest_dir/dist/esbuild/extension.js"
cd "$dest_dir" && vsce package
