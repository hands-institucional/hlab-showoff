#!/bin/bash
DIR=`dirname $0`
cd $DIR/../../
rm -rf dist
mkdir dist
cp -rRp code/src/. dist
