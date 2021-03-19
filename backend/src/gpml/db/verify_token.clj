(ns gpml.db.verify-token
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/verify-tokens.sql")

#_(all-users (dev/db))
