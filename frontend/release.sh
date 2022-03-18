#!/usr/bin/env bash

set -euo pipefail

yarn install --no-progress --frozen-lock
yarn eslint --config .eslintrc.prod.json src --ext .js,.jsx
yarn prettier --check src/
yarn build
