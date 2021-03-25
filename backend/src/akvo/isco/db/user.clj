(ns akvo.isco.db.user
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/users.sql")
