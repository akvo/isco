#!/usr/bin/env bash

# TEMPORARY CODE TO PUSH CREDENTIALS WHEN DEPLOY
# REQUIRE UNTIL KUBECTL REPO SECRET DEPLOYMENT IS FIXED

repo_url=$(git config --get remote.origin.url | cut -d '/' -f2 | sed 's/.git//g')
gcloud container clusters get-credentials test --zone europe-west1-d --project akvo-lumen
podname=$(kubectl get pods | grep "$repo_url" | cut -d' ' -f1)
kubectl -it exec "$podname" -c backend -- bash -c "rm -rf /secrets && mkdir /secrets"
kubectl cp \
    ../akvo-config/k8s-secrets/test/isco/isco-service-account.json \
    "$podname:/secrets/credentials.json" -c backend

