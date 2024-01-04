#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

# Normal Docker Compose
dc () {
    docker compose \
    --ansi never \
    "$@"
}

# Docker compose using integration test env
dci () {
    dc -f docker-compose.yml \
    -f docker-compose.ci.yml "$@"
}

image_prefix="eu.gcr.io/akvo-lumen/isco"

integration_test() {
    for file in ./tests/sides/*.side; do
        sed -i 's/localhost\:3000/localhost/g' $file
    done
    
    if ! dci run --quiet-pull -T selenium ./run.sh; then
        dci logs
        echo "Build failed when running integration test"
        exit 1
    fi
    
}

frontend_build () {
    
    echo "PUBLIC_URL=/" > frontend/.env
    sed 's/"warn"/"error"/g' < frontend/.eslintrc.json > frontend/.eslintrc.prod.json
    touch "frontend/public/${MAILJET_VERIFICATION_FILE}.txt"
    
    dc run \
    --rm \
    --quiet-pull \
    frontend \
    bash release.sh
    
    docker build \
    --quiet \
    --tag "${image_prefix}/frontend:latest" \
    --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
    
    dc down
    
}

backend_build () {
    
    docker build \
    --quiet \
    --tag "${image_prefix}/backend:latest" \
    --tag "${image_prefix}/backend:${CI_COMMIT}" backend
    
    # Test and Code Quality
    dc -f docker-compose.test.yml \
    -p backend-test \
    run --rm --quiet-pull -T backend ./test.sh
    
    dc -f docker-compose.test.yml down
}

backend_build
frontend_build
# integration_test
