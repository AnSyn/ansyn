#!/bin/bash
for lib in dist/ansyn/* ; do
    npm publish "$lib" --access public
done
