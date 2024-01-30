#!/bin/bash
set -eu -o pipefail

dest_dir=dist/package

# copy to clean directory for vsce
rm -rf "$dest_dir"
mkdir -p "$dest_dir/dist"
cp package.json README.md LICENSE.txt "$dest_dir"
cp dist/extension.js "$dest_dir/dist"
cd "$dest_dir" && vsce package
