#!/usr/bin/env bash

export PGPASSWORD=""

test_db="the_test_db_name"
prod_db="the_prod_db_name"
db_file=./test.dump
db_user=isco
db_host=localhost

pg_dump -U "$db_user" -h $db_host -Fc $test_db > "$db_file"
dropdb -U $db_user -h $db_host --if-exists  $prod_db
createdb -U $db_user -h $db_host -T template0 $prod_db
pg_restore -U $db_user -h $db_host -d $prod_db "$db_file"
