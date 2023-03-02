#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

## RESTORE IMAGE CACHE
IMAGE_CACHE_LIST=$(grep image \
	./docker-compose.e2e.yml \
	  | cut -d ':' -f3- \
    | sort -u \
    | sed 's/^ *//g')
mkdir -p ./ci/images

while IFS= read -r IMAGE_CACHE; do
    IMAGE_CACHE_LOC="./ci/images/${IMAGE_CACHE//\//-}.tar"
    if [ -f "${IMAGE_CACHE_LOC}" ]; then
        docker load -i "${IMAGE_CACHE_LOC}"
    fi
done <<< "${IMAGE_CACHE_LIST}"

image_prefix="eu.gcr.io/akvo-lumen/isco"

# Normal Docker Compose
dc () {
    docker compose \
        --ansi never \
        "$@"
}

# Docker compose using CI env
dci () {
    dc -f docker-compose.yml \
       -f docker-compose.ci.yml "$@"
}

integration_test() {
		for file in ./tests/sides/*.side; do
			sed -i 's/localhost\:3000/localhost/g' $file
		done

		dci -f docker-compose.e2e.yml \
			-p integration-test \
			run --rm -T selenium ./run.sh

		./tests/logs.sh

}

frontend_build () {

    echo "PUBLIC_URL=/" > frontend/.env
    sed 's/"warn"/"error"/g' < frontend/.eslintrc.json > frontend/.eslintrc.prod.json
    touch "frontend/public/${MAILJET_VERIFICATION_FILE}.txt"

    dc run \
       --rm \
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
        run --rm -T backend ./test.sh

}

backend_build
frontend_build
integration_test

#test-connection
if [[ "${CI_BRANCH}" ==  "main" && "${CI_PULL_REQUEST}" !=  "true" ]]; then
    if ! dci run -T ci ./basic.sh; then
      dci logs
      echo "Build failed when running basic.sh"
      exit 1
    fi
fi

## STORE IMAGE CACHE
while IFS= read -r IMAGE_CACHE; do
    IMAGE_CACHE_LOC="./ci/images/${IMAGE_CACHE//\//-}.tar"
    if [[ ! -f "${IMAGE_CACHE_LOC}" ]]; then
        docker save -o "${IMAGE_CACHE_LOC}" "${IMAGE_CACHE}"
    fi
done <<< "${IMAGE_CACHE_LIST}"
## END STORE IMAGE CACHE
