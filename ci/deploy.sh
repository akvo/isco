#!/usr/bin/env bash

# The required env vars require a registry_prefix depending on the deploy environment:
#   prod: PROD_
#   test: TEST_
# For example the required var is CLOUDSDK_CORE_PROJECT.
# In the prod environment it should be PROD_CLOUDSDK_CORE_PROJECT
#
# Required env vars:
#   CLOUDSDK_CORE_PROJECT - ID of the GCP project
#   CLOUDSDK_CONTAINER_CLUSTER - ID of the GKE cluster
#   CLOUDSDK_COMPUTE_ZONE - the zone of the gke cluster
#   GCP_DOCKER_HOST - Where to push the docker images to
#   GCP_SERVICE_ACCOUNT_FILE - path to file containing GCP service account credentials
#   IMAGE_PREFIX - The host (and path if necessary) to push the docker images to
set -exuo pipefail

#[[ "${CI_BRANCH}" !=  "main" && ! "${CI_TAG:=}" =~ promote.* ]] && { echo "Branch different than main and not a tag. Skip deploy"; exit 0; }
#[[ "${CI_PULL_REQUEST:-}" ==  "true" ]] && { echo "Pull request. Skip deploy"; exit 0; }

if [[ "${CI_TAG:=}" =~ promote.* ]]; then
  PROD_DEPLOY=1
fi

export CLOUDSDK_CONTAINER_USE_CLIENT_CERTIFICATE=False

generate_vars(){
  PREFIX="$1"
  TO_GEN=(
    "CLOUDSDK_CORE_PROJECT"
    "CLOUDSDK_CONTAINER_CLUSTER"
    "CLOUDSDK_COMPUTE_ZONE"
    "GCP_DOCKER_HOST"
    "GCP_SERVICE_ACCOUNT_FILE"
    "IMAGE_PREFIX"
  )
  for to_gen in "${TO_GEN[@]}" ; do
      varname="${PREFIX}_${to_gen}"
      # ${!varname} = give me value or variable with the name stored in varname
      # bash... I know
      echo "exporting $to_gen"
      export "$to_gen"="${!varname}"
  done
}

auth () {
    gcloud auth activate-service-account --key-file="${GCP_SERVICE_ACCOUNT_FILE}"
    gcloud auth configure-docker "${GCP_DOCKER_HOST}"
}

push_image () {
    suffix="${1}:${CI_COMMIT}"

    local_name="isco/$suffix"
    remote_name="${IMAGE_PREFIX}/$suffix"

    docker tag $local_name $remote_name
    docker push "${remote_name}"
}

prepare_deployment () {
    gcloud container clusters get-credentials "${CLOUDSDK_CONTAINER_CLUSTER}"

    sed "s/\${CI_COMMIT}/${CI_COMMIT}/g;" \
        ci/k8s/deployment.template.yml \
        | sed "s/\${BUCKET_FOLDER}/${CLOUDSDK_CONTAINER_CLUSTER}/g;" \
        | sed "s|\${IMAGE_PREFIX}|${IMAGE_PREFIX}|g;" \
        > ci/k8s/deployment.yml
}

apply_deployment () {
    kubectl apply -f ci/k8s/deployment.yml
    kubectl apply -f ci/k8s/service.yml
}

set +x  # Disable printing the variable values; values might be secret
if [[ -n "${PROD_DEPLOY:=}" ]] ; then
  generate_vars "PROD"
else
  generate_vars "TEST"
fi
set -x  # Renable it

auth

if [[ -z "${CI_TAG:=}" ]]; then
    push_image backend
    push_image frontend
fi

prepare_deployment
apply_deployment

ci/k8s/wait-for-k8s-deployment-to-be-ready.sh
