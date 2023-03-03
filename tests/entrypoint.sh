#!/bin/sh

set -ex

apk add \
    --no-cache \
    --no-progress \
    bash~=5 \
    curl~=7 \
    jq~=1.6

http_get() {
    url="${1}"
    shift
    code="${1}"
    shift
    curl --verbose --url "${url}" "$@" 2>&1 | grep "< HTTP.*${code}"
}

http_get "http://localhost" 200
http_get "http://localhost/${MAILJET_VERIFICATION_FILE}.txt" 200
http_get "http://localhost/config.js" 200
http_get "http://localhost/api/" 200
http_get "http://localhost/api/docs" 200

exec "$@"
