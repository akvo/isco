(ns akvo.flow-to-rsr
  (:require [akvo.lumen.lib.import.common :as common]
            [akvo.lumen.postgres :as postgres]
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
  (let [token "your token"]
    (execute (source "uat1" "722939140" "713029131" "juan@akvo.org" token)
             (import-config "https://api-auth0.akvotest.org/flow"))))
