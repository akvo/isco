#!/usr/bin/env bash

python -m seeder.member_isco_type
python -m seeder.organisation
python -m seeder.user

# for cascade list, run: python -m seeder.cascade_interactive