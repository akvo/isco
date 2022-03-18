#!/usr/bin/env bash
#shellcheck disable=SC2001

if [[ -z "${SKIP_MIGRATION}" ]]; then
    alembic upgrade head
fi

python main.py
