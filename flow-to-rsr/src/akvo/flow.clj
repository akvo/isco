(ns akvo.flow
  (:require
   [akvo.lumen.lib.import.common :as common]
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
   "instance" instance
   "surveyId" survey-id
   "formId" form-id
   "version" 3
   "email" email
   "token" token})

(defn execute [source import-config]
  (with-open [importer (common/datagroups-importer source import-config)]
    (let [rows (p/records importer)
          columns  (adapt-columns (p/columns importer))]
      #_(doseq [[groupId cols] (group-by :groupId columns)]
          (log/error groupId cols))
      (doseq [response (take common/rows-limit rows)]
        (let [metadata  (->> response
                             (filter (fn [[groupId iterations]] (= groupId "metadata")))
                             first
                             last
                             first)
              not-metadata-groups (filter (fn [[groupId iterations]]
                                            (not= groupId "metadata")
                                            ) response)]
          (log/error :metadata metadata)
          (doseq [[groupId iterations] not-metadata-groups]
            (log/error groupId (->> iterations
                                    (mapv #(merge % metadata)) ;; we merge metadata submission in all group responses for later process data massaging
                                    (mapv postgres/coerce-to-sql)))))))))
