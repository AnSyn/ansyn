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

echo "start deploying version $version on target $target"

eval $(aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $target)

docker tag "ansyn:$version" "$target:latest"

docker tag "$target:latest" "$target:latest"

docker tag "$target:latest" "$target:$version"

docker push "$target:latest"

docker push "$target:$version"

echo "deployment succeeded";

cluster=$3
services=$4

node scripts/kill-tasks.js $cluster $services
