#!/usr/bin/env bash
#shellcheck disable=SC2001

DB_HOST=$(sed 's/^.*\(@.*:\).*$/\1/' <<< "${DATABASE_URL}" | sed 's/@//' | sed 's/\://')
./wait-for-it.sh -h "${DB_HOST}" -p 5432 -- echo "Database is up and running"

if [[ -z "${SKIP_MIGRATION}" ]]; then
    alembic upgrade head
fi

python main.py
