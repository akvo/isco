(ns akvo.isco.handler.users
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [akvo.isco.config :as c]
            [clojure.java.jdbc :as jdbc]
            [akvo.isco.db.user :as db.user]
            [duct.logger :as log]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]))

(defn find-questionnaire [questionnaires q]
  (first (filter #(= q (:name %)) questionnaires)))

(defn user-res-data [user role questionnaires]
  (merge
   user
   {
    :questionnaires (mapv (partial find-questionnaire questionnaires) (:questionnaires user))
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
        questionnaires (:questionnaires config)
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
      (mapv #(user-res-data % (get roles (keyword (:role %))) questionnaires) data)}}))

#_(first (db.user/all-users (dev/db)))

(defmethod ig/init-key :akvo.isco.handler.users/get [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page })
    (let [data (db.user/all-users (:spec db))]
      (resp/response (res "https://gisco-demo.tc.akvo.org" page data config)))))

(def patch-params
  [:map
   [:name string?]
   [:role string?]
   [:questionnaires [:vector string?]];; TODO fix FE to not send null
   [:organization_id int?]])

(comment
  (require '[malli.core :as m])
  ;; TODO: expected payload
  (def payload {:name "Juan",
                :role "admin",
                :questionnaires [],
                :organization_id 74})

  (m/validate patch-params payload)
  )


(defmethod ig/init-key :akvo.isco.handler.users/user-patch-params [_ _]
  patch-params)


(defmethod ig/init-key :akvo.isco.handler.users/patch [_ {:keys [db logger config]}]
  (fn [{:keys [body-params parameters] :as req}]
    ;;    {{{:keys [id]} :path} :parameters}
    (println (:id (:path parameters)) body-params)
    (jdbc/with-db-transaction [conn (:spec db)]
      (db.user/patch-user conn (merge (:path parameters) body-params))
      (let [updated-user (db.user/user-by-id conn (:path parameters))
            res (merge updated-user
                       {:role (get (:roles config) (keyword (:role updated-user)))
                        :last_activity "2021-03-23 10:26:14"
                        :questionnaires
                        (mapv (partial find-questionnaire (:questionnaires config)) (:questionnaires updated-user))})]
        (log/error logger res)
        (resp/response res)))))


(defmethod ig/init-key :akvo.isco.handler.users/delete [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [page]} :query} :parameters}]
    (log/info logger {:page page})
    (resp/response (res page))))
