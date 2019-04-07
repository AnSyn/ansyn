#!/bin/bash
BUILDS=("menu" "imagery" "map-facade" "ansyn")
len=${#BUILDS[*]}
for (( i=0; i<len; i++ ))
do
    ng build @ansyn/${BUILDS[$i]} || exit 1
done
