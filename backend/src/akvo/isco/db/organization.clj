(ns akvo.isco.db.organization
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/organizations.sql")
