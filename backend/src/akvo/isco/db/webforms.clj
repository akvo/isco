(ns akvo.isco.db.webforms
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "akvo/isco/db/webforms.sql")

(comment
  (all-not-submitted-webforms (dev/db))
  (new-webform (dev/db) {:organization_id 1
                         :form_instance_url
                         "idh/111890828/13b336fd-cc2b-431c-9c29-0aad3a781858"
                         :form_instance_id "idh"
                         :submitted true
                         :updated_at "2021-04-05T08:34:25.000000Z"
                         :form_id 111890828
                         :user_id 1
                         :uuid nil
                         :display_name nil})


{:organization_id 1,
 :updated #inst "2021-04-05T09:56:00.472659000-00:00",
 :form_instance_url
 "idh/111890828/13b336fd-cc2b-431c-9c29-0aad3a781858",
 :form_instance_id "idh",
 :created #inst "2021-04-05T09:56:00.472659000-00:00",
 :submitted true,
 :id 1,
 :form_id 111890828,
 :user_id 1,
 :uuid nil,
 :display_name nil}

  (user-by-id (dev/db) )

  (first (all-users (dev/db)))

  (patch-user (dev/db) {:role "admin",
                         :organization_id 1,

                         :name "Juan3",

                         :id 1,
                        :questionnaires []})
  )
