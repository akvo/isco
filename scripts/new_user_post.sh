#!/bin/bash

# Copy example_users.csv to users.csv
# Make necessary changes
# NOTE: Questionnaire List separated by pipe "|"
# Change the domain

domain="http://localhost:3000"
for i in $(tail -n +2 users.csv); do
    uname=$(echo "$i" | cut -d "," -f 1)
    mail=$(echo "$i" | cut -d "," -f 2)
    phone=$(echo "$i" | cut -d "," -f 3)
    role=$(echo "$i" | cut -d "," -f 4)
    org=$(echo "$i" | cut -d "," -f 5)
    qs=$(echo "$i" | cut -d "," -f 6 | sed 's/|/,/g')
    payload="name=${uname}&email=${mail}&password=&phone_number=${phone}&role=${role}&organisation=${org}&questionnaires=${qs}"
    echo $payload
    curl -X 'POST' "${domain}/api/user/register?invitation=true" \
      -H 'accept: application/json' \
      -H 'Content-Type: application/x-www-form-urlencoded' \
      -d "$payload"
done
