(ns akvo.isco.db.verify-token
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/verify-tokens.sql")
