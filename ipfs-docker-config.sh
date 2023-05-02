#!/bin/sh
set -ex
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"127.0.0.1:80\", \"http://localhost\"]"
ipfs daemon