#!/usr/bin/env sh

set -exuo pipefail

selenium-side-runner -s http://localhost:4444 --output-directory ./out ./sides/*.side
