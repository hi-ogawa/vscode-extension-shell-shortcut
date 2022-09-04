#!/bin/bash
set -eu -o pipefail

# bundle
npm run esbuild

# copy to clean directly for vsce
dest_dir=build/package
rm -rf "$dest_dir"
mkdir -p "$dest_dir/build/esbuild"
cp package.json README.md LICENSE.txt "$dest_dir"
cp build/esbuild/extension.js "$dest_dir/build/esbuild/extension.js"
cd "$dest_dir" && vsce package --no-dependencies
