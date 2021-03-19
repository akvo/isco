(ns gpml.handler.users
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.config :as c]
            [gpml.db.user :as db.user]
            [duct.logger :as log]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]))

(defn user-res-data [user role]
  (merge
   user
   {
    :questionnaires []
    :role role
    :organization
    {:id 78,
     :parent_id nil,
     :code nil,
     :name "staff Akvo",
     :level 1,
     :active 1,
     :parents nil}})
  )

(defn res [page data config]
  {:last_activity "2021-03-23T09:22:54.039708Z",
   :data
   {:path "https://gisco-demo.tc.akvo.org/api/users",
    :current_page page
    :last_page 5,
    :total 45,
    :from 1,
    :to 10,
    :prev_page_url nil,
    :first_page_url "https://gisco-demo.tc.akvo.org/api/users?page=1",
    :next_page_url "https://gisco-demo.tc.akvo.org/api/users?page=2",
    :last_page_url "https://gisco-demo.tc.akvo.org/api/users?page=5",
    :per_page 10,
    :links
    [{:url nil, :label "&laquo; Previous", :active false}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=1",
      :label 1,
      :active true}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=2",
      :label 2,
      :active false}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=3",
      :label 3,
      :active false}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=4",
      :label 4,
      :active false}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=5",
      :label 5,
      :active false}
     {:url "https://gisco-demo.tc.akvo.org/api/users?page=2",
      :label "Next &raquo;",
      :active false}],
    :data
    [(user-res-data (first data) (get (:roles config) (keyword (:role (first data)))))
     ]}})

#_(first (db.user/all-users (dev/db)))

(defmethod ig/init-key :gpml.handler.users/get [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page })
    (let [data (db.user/all-users (:spec db))]
      (resp/response (res page data config)))))




;; TODO: expected payload
(comment
  payload
  {:name "Juan",
  :role "admin",
  :questionnaires ["113130042" "105640815"],
   :organization_id 74})

(defmethod ig/init-key :gpml.handler.users/patch [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page})
    (resp/response {:role
                    {:key "admin",
                     :name "Admin",
                     :permissions ["submit-survey" "manage-surveys" "manage-users"],
                     :description nil},
                    :email "juan@akvo.org",
                    :email_verified_at "2021-02-25T08:19:28.000000Z",
                    :organization_id 74,
                    :two_factor_recovery_codes nil,
                    :name "Juan",
                    :updated_at "2021-03-23T10:26:26.000000Z",
                    :last_activity "2021-03-23 10:26:14",
                    :id 50,
                    :two_factor_secret nil,
                    :questionnaires
                    [{:name "113130042",
                      :title "B - Industry",
                      :url
                      "https://tech-consultancy.akvotest.org/akvo-flow-web/idh/113130042"}
                     {:name "105640815",
                      :title "C - Retail",
                      :url
                      "https://tech-consultancy.akvotest.org/akvo-flow-web/idh/105640815"}],
                    :created_at "2021-02-25T08:19:15.000000Z"})))


(defmethod ig/init-key :gpml.handler.users/delete [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page})
    (resp/response (res page))))
