#!/bin/bash
BUILDS=("menu" "imagery" "map-facade" "ol" "ansyn")
len=${#BUILDS[*]}
for (( i=0; i<len; i++ ))
do
    ng build @ansyn/${BUILDS[$i]} || exit 1
done
cp -r src/app/@ansyn/ansyn/assets/ dist/ansyn/ansyn/
