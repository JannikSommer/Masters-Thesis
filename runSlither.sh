#!/bin/sh
mkdir -p analysis/slitherResults
slither . --ignore-compile --filter-paths openzeppelin --checklist > analysis/slitherResults/checklist.md
slither . --ignore-compile --filter-paths openzeppelin 
slither . --ignore-compile --filter-paths openzeppelin  --print human-summary
