#!/usr/bin/env bash
DEST=./dist/ansyn/assets
SOURCE=./src/app/\@ansyn/assets

rm -rf $DEST
cp -rf $SOURCE $DEST
