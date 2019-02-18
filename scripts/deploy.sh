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

eval $(aws ecr get-login --no-include-email --region us-west-2)

docker tag "ansyn:$version" "$target:latest"

docker tag "$target:latest" "223455578796.dkr.ecr.us-west-2.amazonaws.com/$target:latest"

docker tag "$target:latest" "223455578796.dkr.ecr.us-west-2.amazonaws.com/$target:$version"

docker push "223455578796.dkr.ecr.us-west-2.amazonaws.com/$target:latest"

docker push "223455578796.dkr.ecr.us-west-2.amazonaws.com/$target:$version"

echo "deployment succeeded";

cluster=$3
services=$4

node scripts/kill-tasks.js $cluster $services
