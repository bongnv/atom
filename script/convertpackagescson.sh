#! /bin/bash

set -e

find ./packages -type f -name "*.cson" -exec node script/convert2json.js {} \;
find ./packages -type f -name "*.cson" -exec rm {} \;
