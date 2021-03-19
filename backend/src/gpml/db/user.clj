(ns gpml.db.user
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/users.sql")

#_(all-users (dev/db))
