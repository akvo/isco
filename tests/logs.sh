#!/usr/bin/env bash
#shellcheck disable=SC2039

SCRIPT_DIR=$(dirname "$(realpath "$0")")
for file in $SCRIPT_DIR/out/*.json; do
	 docker run -i stedolan/jq '.testResults
		| .[]?
		| .assertionResults
		| .[]?
		| (.status) + ": " + (.title)' < $file | sed 's/"//g'
done
