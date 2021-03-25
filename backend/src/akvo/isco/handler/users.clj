(ns akvo.isco.handler.users
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [akvo.isco.config :as c]
            [akvo.isco.db.user :as db.user]
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

(def page-limit 2)

(defn res [url page data config]
  (let [roles (:roles config)
        total-rows (count data)
        total-pages (+ (quot total-rows page-limit) (if (rem total-rows page-limit) 1 0))
        ;; TODO: fix links active value
        links (vec (conj (map (fn [itm]
                                {:url (format "%s/api/users?page=%s" url itm),
                                 :label itm,
                                 :active true}) (map inc (range total-pages)))
                         {:url nil, :label "&laquo; Previous", :active false}))
        ]
    {:last_activity "2021-03-23T09:22:54.039708Z",
     :data
     {:path (format "%s/api/users" url),
      :current_page page
      :last_page total-pages,
      :total total-rows,
      :from 1 ;; TODO review this value
      :to page-limit ;; TODO review this value
      :prev_page_url nil ;; TODO review this value
      :first_page_url (format "%s/api/users?page=1" url),
      :next_page_url (format "%s/api/users?page=2" url),
      :last_page_url (format "%s/api/users?page=5" url),
      :per_page 10 ;; TODO review this value
      :links links
      :data
      (mapv #(user-res-data % (get roles (keyword (:role %)))) data)}}))

#_(first (db.user/all-users (dev/db)))

(defmethod ig/init-key :akvo.isco.handler.users/get [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page })
    (let [data (db.user/all-users (:spec db))]
      (resp/response (res "https://gisco-demo.tc.akvo.org" page data config)))))




;; TODO: expected payload
(comment
  payload
  {:name "Juan",
  :role "admin",
  :questionnaires ["113130042" "105640815"],
   :organization_id 74})

(defmethod ig/init-key :akvo.isco.handler.users/patch [_ {:keys [db logger config]}]
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


(defmethod ig/init-key :akvo.isco.handler.users/delete [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page})
    (resp/response (res page))))
