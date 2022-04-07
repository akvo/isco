#!/usr/bin/env bash
#shellcheck disable=SC2001

alembic upgrade head
python main.py
