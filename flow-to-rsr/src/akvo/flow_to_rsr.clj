(ns akvo.flow-to-rsr
  (:require [akvo.lumen.lib.import.common :as common]
            [akvo.lumen.postgres :as postgres]
            [akvo.rsr-api :as rsr-api]
            [cheshire.core :as cheshire]
            [akvo.lumen.protocols :as p]
            [akvo.lumen.component.flow :as c.flow]
            [clojure.tools.logging :as log]))

(defn adapt-columns [importer-columns]
  (map (fn [c] (-> c
                   (update :groupName (fn [groupName] (or groupName "main")))
                   (update :groupId (fn [groupId] (or groupId "main")))))
       importer-columns))

(defn import-config [flow-auth0-api-url]
  {:flow-api {:url flow-auth0-api-url
              :internal-url flow-auth0-api-url
              :api-headers akvo.lumen.component.flow/api-headers
              :internal-api-headers akvo.lumen.component.flow/api-headers}
   :environment {"data-groups" true}})

(defn source [instance survey-id form-id email token]
  {"kind" "AKVO_FLOW"
   "instance" "uat1"
   "surveyId" survey-id
   "formId" form-id
   "version" 3
   "email" email
   "token" token})

(defn execute [source import-config]
  (with-open [importer (common/datagroups-importer source import-config)]
    (let [rows (p/records importer)
          columns  (adapt-columns (p/columns importer))]
      (doseq [[groupId cols] (group-by :groupId columns)]
        (log/error groupId cols))
      (doseq [response (take common/rows-limit rows)]
        (doseq [[groupId iterations] response]
          (log/error (mapv postgres/coerce-to-sql iterations)))))))

(comment
  (let [jwt-token "your-jwt-token"]
    (execute (source "uat1" "722939140" "713029131" "juan@akvo.org" jwt-token)
             (import-config "https://api-auth0.akvotest.org/flow"))))



(comment
  (let [rsr-api-token "rsr-api-token"]
    (let [id 32771]
      (log/error :current-value-for id
                 (-> (rsr-api/read-indicator-period-data-framework rsr-api-token id)
                     :body
                     :value)))
    (let [user-id 45824
          period-id 435305
          value (+ 10 (rand-int 100))]
      (log/error :writing-value
                 (rsr-api/write-indicator-period-data rsr-api-token user-id period-id value)))
    ))
