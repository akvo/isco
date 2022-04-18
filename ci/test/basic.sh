#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

RETRIES=10

until psql -h db:5432 -U isco_user -w password -d isco -c "select 1" &>/dev/null 2>&1 || [ $RETRIES -eq 0 ];
do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done

wait4ports -q -s 1 -t 60 tcp://localhost:80 tcp://localhost:5000

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
