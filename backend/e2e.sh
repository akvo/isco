#!/usr/bin/env bash
# shellcheck disable=SC2155

pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head

python -m seeder.member_isco_type
python -m seeder.organisation
python -m seeder.user
python -m seeder.roadmap_init

python main.py
