#!/usr/bin/env bash

echo PUBLIC_URL="/" > .env
yarn install --no-progress --frozen-lock
yarn start