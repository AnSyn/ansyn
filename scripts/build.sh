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

# frome here: https://stackoverflow.com/questions/29836823/how-to-increase-timeout-in-travis-ci-for-my-selenium-tests-written-on-java
# send the long living command to background
docker build -t "$target:$version" . &

# Constants
RED='\033[0;31m'
minutes=0
limit=40

while kill -0 $! >/dev/null 2>&1; do
  echo -n -e " \b" # never leave evidences!

  if [ $minutes == $limit ]; then
    echo -e "\n"
    echo -e "${RED}Test has reached a ${minutes} minutes timeout limit"
    exit 1
  fi

  minutes=$((minutes+1))

  sleep 60
done

exit 0
