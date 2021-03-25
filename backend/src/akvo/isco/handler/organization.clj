(ns akvo.isco.handler.organization
  (:require [akvo.isco.db.organization :as db.organization]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :akvo.isco.handler.organization/handler [_ {:keys [db]}]
  (fn [{{{:keys [id]} :query} :parameters}]
    (let [conn (:spec db)
          data (if id
                 (db.organization/org-by-id conn {:id id})
                 (let [orgs (db.organization/all-orgs conn)]
                   (mapv #(select-keys % [:id :name :active]) orgs)))]
      (resp/response (or data [])))))
