#!/usr/bin/env bash
# Required env vars:
#   CLOUDSDK_CORE_PROJECT - ID of the GCP project
#   CLOUDSDK_CONTAINER_CLUSTER - ID of the GKE cluster
#   CLOUDSDK_CONTAINER_USE_CLIENT_CERTIFICATE -
#   CLOUDSDK_COMPUTE_ZONE - the zone of the gke cluster
#   GCP_DOCKER_HOST - Where to push the docker images to
# Optional env vars:
#   IMAGE_PREFIX - The host (and path if necessary) to push the docker images to
#   GCP_SERVICE_ACCOUNT_FILE - path to file containing GCP service account credentials
set -exuo pipefail

#[[ "${CI_BRANCH}" !=  "main" && ! "${CI_TAG:=}" =~ promote.* ]] && { echo "Branch different than main and not a tag. Skip deploy"; exit 0; }
#[[ "${CI_PULL_REQUEST:-}" ==  "true" ]] && { echo "Pull request. Skip deploy"; exit 0; }

test -n "${CLOUDSDK_CORE_PROJECT}"
test -n "${CLOUDSDK_CONTAINER_CLUSTER}"
test -n "${CLOUDSDK_CONTAINER_USE_CLIENT_CERTIFICATE}"
test -n "${CLOUDSDK_COMPUTE_ZONE}"
test -n "${GCP_DOCKER_HOST}"

auth () {
    gcloud auth activate-service-account --key-file="${GCP_SERVICE_ACCOUNT_FILE:-/home/semaphore/.secrets/gcp.json}"
    gcloud auth configure-docker "${GCP_DOCKER_HOST}"
}

push_image () {
    prefix="${IMAGE_PREFIX}"
    docker push "${prefix}/${1}:${CI_COMMIT}"
}

prepare_deployment () {
    cluster="production"

    if [[ "${CI_TAG:=}" =~ promote.* ]]; then
        cluster="production"
    fi

    gcloud container clusters get-credentials "${cluster}"

    sed "s/\${CI_COMMIT}/${CI_COMMIT}/g;" \
        ci/k8s/deployment.template.yml \
        | sed "s/\${BUCKET_FOLDER}/${cluster}/g;" \
        | sed "s|\${IMAGE_PREFIX}|${IMAGE_PREFIX}|g;" \
        > ci/k8s/deployment.yml
}

apply_deployment () {
    kubectl apply -f ci/k8s/deployment.yml
    kubectl apply -f ci/k8s/service.yml
}

auth

if [[ -z "${CI_TAG:=}" ]]; then
    push_image backend
    push_image frontend
fi

prepare_deployment
apply_deployment

ci/k8s/wait-for-k8s-deployment-to-be-ready.sh
