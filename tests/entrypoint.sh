#!/bin/sh

set -ex

apk add \
    --no-cache \
    --no-progress \
    bash~=5 \
    curl~=7 \
    jq~=1.6

exec "$@"
