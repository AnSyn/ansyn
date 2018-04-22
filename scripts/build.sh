#!/bin/bash

target=$1
echo "target $target"
if [ -z "$target" ]
then
	echo "Missing deployment target"
	exit 1
fi

version=$2
echo "version $version"
if [ -z "$version" ]
then
	echo "Missing deployment version"
	exit 1
fi

tag=$3
echo "tag $tag"
if [ -n "$tag" ]
then
	version=$tag
fi

docker build -t "$target:$version" .
