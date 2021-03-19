(ns gpml.db.organization
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/organizations.sql")
