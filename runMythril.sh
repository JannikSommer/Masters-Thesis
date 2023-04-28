#!/bin/sh
mkdir -p analysis/mythrilResults
for file in contracts/*.sol; do
    echo Analyzing $file
    myth analyze $file -t 3 --solc-json analysis/mythrilConfig.json > analysis/mythrilResults/$(basename $file .sol).txt
done
