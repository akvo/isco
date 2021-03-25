(ns akvo.isco.db.user
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/users.sql")

(comment
  (user-by-id (dev/db) )

  (first (all-users (dev/db)))

  (patch-user (dev/db) {:role "admin",
                         :organization_id 1,

                         :name "Juan3",

                         :id 1,
                        :questionnaires []})
  )
