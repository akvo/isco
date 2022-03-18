#!/usr/bin/env bash

set -euo pipefail

yarn install --no-progress --frozen-lock
yarn eslint src/
yarn prettier --check src/
yarn build
