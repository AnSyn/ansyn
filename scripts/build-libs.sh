#!/bin/bash
BUILD_ASSETS=./src/app/\@ansyn/assets/build.sh
chmod +x $BUILD_ASSETS
BUILDS=("core" "menu" "overlays" "status-bar" "imagery" "map-facade" "context" "menu-items" "plugins" "ansyn")
len=${#BUILDS[*]}
for (( i=0; i<len; i++ ))
do
    ng build @ansyn/${BUILDS[$i]} || exit 1
done
$BUILD_ASSETS
