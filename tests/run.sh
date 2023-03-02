#!/usr/bin/env sh

set -exuo pipefail

sleep 5

selenium-side-runner -s http://localhost:4444 --output-directory ./out ./sides/*.side

exit 0
