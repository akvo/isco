#!/usr/bin/env bash
#shellcheck disable=SC2039

SCRIPT_DIR=$(dirname "$(realpath "$0")")

if [ -z "$(ls -A $SCRIPT_DIR/out)" ]; then
  echo "Out directory is empty"
else
	for file in $SCRIPT_DIR/out/*.json; do
		 docker run -i stedolan/jq '.testResults
			| .[]?
			| .assertionResults
			| .[]?
			| (.status) + ": " + (.title)' < $file | sed 's/"//g'
	done
fi


