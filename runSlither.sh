#!/bin/sh
mkdir -p analysis/slitherResults
slither . --ignore-compile --checklist > analysis/slitherResults/checklist.md
slither . --ignore-compile
slither . --ignore-compile --print human-summary
