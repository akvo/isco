#!/usr/bin/env bash

SOURCE_PATH="$1"
CONTAINER="$2"

repo_url=$(git config --get remote.origin.url | cut -d '/' -f2 | sed 's/.git//g')
gcloud container clusters get-credentials test --zone europe-west1-d --project akvo-lumen
podname=$(kubectl get pods | grep "$repo_url" | cut -d' ' -f1)
kubectl cp "$SOURCE_PATH" "$podname:/usr/src/app/$SOURCE_PATH" -c "$CONTAINER"
