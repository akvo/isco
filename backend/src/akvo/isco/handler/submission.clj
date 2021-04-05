(ns akvo.isco.handler.submission
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [duct.logger :as log]
            [clojure.pprint :refer (pprint)]
            [akvo.isco.db.webforms :as db.webforms]
            [clojure.data.csv :as csv]
            [clojure.java.jdbc :as jdbc]
            [akvo.isco.utils :as iu])
  (:import [java.io StringWriter]))

(defmethod ig/init-key :akvo.isco.handler.submission/check [_ {:keys [db logger]}]
  (fn [{{{:keys [id]} :path} :parameters :as req}]
    (log/info logger {:akvo.isco.handler.submission/check id})
    (resp/response (mapv str [150981538 113130042 105640815]))))

(defmethod ig/init-key :akvo.isco.handler.submission/check-form [_ {:keys [db logger]}]
  (fn [{{{:keys [id form-id]} :path} :parameters :as req}]
    (log/info logger {:akvo.isco.handler.submission/check-form [id form-id] })
    (resp/response {:counts nil, :max_submission false, :submissions [], :users []})))


(defmethod ig/init-key :akvo.isco.handler.submission/submitted [_ {:keys [db logger config]}]
  (fn [req]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [webforms (db.webforms/all-submitted-webforms conn)]
        (resp/response (mapv #(let [q (iu/find-questionnaire (:questionnaires config) (:form_id %))]
                                (assoc %
                                       :uuid "eyyy" ;; TODO: load uuid
                                       :form_name (:title q)))
                             webforms))))))

(defmethod ig/init-key :akvo.isco.handler.submission/sync-download [_ {:keys [db logger config]}]
  (fn [{{{:keys [uuid form-id form-title]} :path} :parameters :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [webforms (db.webforms/all-submitted-webforms conn)]
        (assoc-in (resp/response (let [w (StringWriter.)]
                                   (csv/write-csv w [["a" "b"]["c" "d"]])
                                   (str w)))
                  [:headers "Content-Type"] "text/csv")))))
