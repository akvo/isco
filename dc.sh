#!/usr/bin/env bash

if ! command -v pre-commit &> /dev/null
then
	if [ -f "./git/hooks/pre-commit" ]; then
		echo "File exists"
	else
		pre-commit install
	fi
fi

COMPOSE_HTTP_TIMEOUT=180 docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose-docker-sync.yml "$@"
