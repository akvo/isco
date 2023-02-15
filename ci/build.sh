#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

BACKEND_CHANGES=0
FRONTEND_CHANGES=0

COMMIT_CONTENT=$(git diff --name-only "${CI_COMMIT_RANGE}")

if grep -q "backend" <<< "${COMMIT_CONTENT}"
then
    BACKEND_CHANGES=1
fi

if grep -q "frontend" <<< "${COMMIT_CONTENT}"
then
    FRONTEND_CHANGES=1
fi

if grep -q "ci" <<< "${COMMIT_CONTENT}"
then
    BACKEND_CHANGES=1
    FRONTEND_CHANGES=1
fi

if [[ "${CI_BRANCH}" ==  "main" && "${CI_PULL_REQUEST}" !=  "true" ]];
then
    BACKEND_CHANGES=1
    FRONTEND_CHANGES=1
fi


image_prefix="eu.gcr.io/akvo-lumen/isco"

# Normal Docker Compose
dc () {
    docker-compose \
        --ansi never \
        "$@"
}

# Docker compose using CI env
dci () {
    dc -f docker-compose.yml \
       -f docker-compose.ci.yml "$@"
}

frontend_build () {

    echo "PUBLIC_URL=/" > frontend/.env
    sed 's/"warn"/"error"/g' < frontend/.eslintrc.json > frontend/.eslintrc.prod.json
    touch "frontend/public/${MAILJET_VERIFICATION_FILE}.txt"

    dc run \
       --rm \
       --no-deps \
       frontend \
       bash release.sh

    docker build \
        --tag "${image_prefix}/frontend:latest" \
        --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}

backend_build () {

    docker build \
        --tag "${image_prefix}/backend:latest" \
        --tag "${image_prefix}/backend:${CI_COMMIT}" backend

    # Test and Code Quality
    dc -f docker-compose.test.yml \
        -p backend-test \
        run --rm -T backend ./test.sh

}

end_to_end_test() {
	backend_build
	frontend_build

  dc -f docker-compose.test.yml \
		-p end-to-end \
		run --rm -T selenium ./run.sh
}

if [[ ${BACKEND_CHANGES} == 1 ]];
then
    echo "================== * BACKEND BUILD * =================="
    backend_build
else
    echo "No Changes detected for backend -- SKIP BUILD"
fi

if [[ ${FRONTEND_CHANGES} == 1 ]];
then
    echo "================== * FRONTEND BUILD * =================="
    frontend_build
else
    echo "No Changes detected for frontend -- SKIP BUILD"
fi



#test-connection
if [[ ${FRONTEND_CHANGES} == 1 && ${BACKEND_CHANGES} == 1 ]]; then
    if ! dci run -T ci ./basic.sh; then
      dci logs
      echo "Build failed when running basic.sh"
      exit 1
    fi
fi
