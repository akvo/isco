(ns akvo.isco.handler.questionnaires
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [duct.logger :as log]
            [clojure.java.jdbc :as jdbc]
            [akvo.isco.db.webforms :as db.webforms]
            [akvo.isco.db.collaborators :as db.collaborators]
            [clojure.string :as str]
            [akvo.isco.utils :as iu]
            [clojure.pprint :refer (pprint)]))

(defmethod ig/init-key :akvo.isco.handler.questionnaires/handler [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
;;    (log/debug logger (:questionnaires config))
    (resp/response (:questionnaires config))))



(defmethod ig/init-key :akvo.isco.handler.questionnaires/collaborators [_ {:keys [db logger config]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [webform (db.webforms/webform-by-id conn {:id id})
            collaborators (conj (mapv
                                 #(assoc % :primary false)
                                 (db.collaborators/all-collaborators-by-webform conn {:webform_id id}))
                                {:organization_id (:organization_id webform)
                                 :organization_name (:organization_name webform)
                                 :primary true})]
        (resp/response collaborators)))))


(defmethod ig/init-key :akvo.isco.handler.questionnaires/new-collaborators [_ {:keys [db logger config]}]
  (fn [{{{:keys [id orgid]} :path} :parameters}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [webform (db.webforms/webform-by-id conn {:id id})
            new-collaborator (db.collaborators/new-collaborator conn {:webform_id id :organization_id orgid})]
        ;; TODO notify via email!
        (resp/response {:id (:id new-collaborator)
                        :organization_id (:organization_id new-collaborator)
                        :web_form_id (:webform_id new-collaborator)})))))

(defmethod ig/init-key :akvo.isco.handler.questionnaires/delete-collaborator [_ {:keys [db logger config]}]
  (fn [{{{:keys [id orgid]} :path} :parameters}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [webform (db.webforms/webform-by-id conn {:id id})
            res (db.collaborators/delete-collaborator conn {:webform_id id :organization_id orgid})]
        (resp/response {:res res})))))
