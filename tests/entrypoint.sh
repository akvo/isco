#!/bin/sh

set -ex

apk add \
    --no-cache \
    --no-progress \
    bash~=5 \
    curl~=7 \
    jq~=1.6 \
		postgresql14-client~=14.7-r0 \
		wait4ports~=0.3.3

RETRIES=10

until PGPASSWORD=password psql -h db -U isco_user -d isco -c "select 1" &>/dev/null 2>&1 || [ $RETRIES -eq 0 ];
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

exec "$@"
