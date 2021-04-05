(ns akvo.isco.db.collaborators
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/collaborators.sql")
