#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

wait4ports -q -s 1 -t 60 tcp://localhost:80 tcp://localhost:5000

http_get() {
    url="${1}"
    shift
    code="${1}"
    shift
    curl --verbose --url "${url}" "$@" 2>&1 | grep "< HTTP.*${code}"
}

http_get "http://localhost" 200
http_get "http://localhost/api/" 200
http_get "http://localhost/api/docs" 200
