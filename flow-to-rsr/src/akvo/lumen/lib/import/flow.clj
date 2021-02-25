(ns akvo.lumen.lib.import.flow
  (:require [akvo.lumen.lib.import.common :as import]
            [akvo.lumen.protocols :as p]
            [akvo.lumen.lib.import.flow-common :as flow-common]
            [akvo.lumen.lib.import.flow-v2 :as v2]
            [akvo.lumen.lib.import.flow-v3 :as v3]
            [akvo.lumen.lib.import.flow-v4 :as v4]
            [clojure.tools.logging :as log]))

(defn- read-flow-urls [flow-api]
  {:internal (:internal-url flow-api)
   :url (:url flow-api)})

(defn adapter [{:keys [version rows-cols instance survey-id form-id]} data]
  data)

(defmethod import/datagroups-importer "AKVO_FLOW"
  [{:strs [instance surveyId formId token email version] :as spec}
   {:keys [flow-api environment] :as config}]
  (let [headers-fn #((:internal-api-headers flow-api) {:email email :token token})
        survey (delay (flow-common/survey-definition (:internal-url flow-api)
                                                     headers-fn
                                                     instance
                                                     surveyId))]
    (reify
      java.io.Closeable
      (close [this])
      p/DatasetImporter
      (columns [this]
        (try
          (let [columns (v3/dataset-columns (flow-common/form @survey formId) environment)
                instance-id-column (first (filter #(= (:id %) "instance_id") columns))
                data-groups (dissoc (group-by #(select-keys % [:groupId :groupName]) columns)
                                    {:groupName "metadata" :groupId "metadata"})
                new-columns (for [[{:keys [groupId groupName]} _] data-groups]
                              (merge instance-id-column {:groupId groupId
                                                         :groupName groupName
                                                         :key false
                                                         :hidden true}))
                data (apply conj columns new-columns)]
            (adapter {:version 4
                      :rows-cols :cols
                      :instance instance
                      :survey-id surveyId
                      :form-id formId} data))
          (catch Throwable e
            (if-let [ex-d (ex-data e)]
              (do
                (log/error e)
                (let [message (if (= 403 (:status ex-d))
                                (str "You don't have access to instance: " instance)
                                (or (:cause e) (str "Null cause from instance: " instance)))]
                  (throw (ex-info message
                                  (assoc ex-d
                                         :instance instance
                                         :flow-urls (read-flow-urls flow-api))))))
              (throw e)))))
      (records [this]
        (try
          (let [data (v4/form-data headers-fn instance @survey formId)]
              (adapter {:version 4
                      :rows-cols :rows
                      :instance instance
                      :survey-id surveyId
                      :form-id formId} data))
          (catch Throwable e
            (if-let [ex-d (ex-data e)]
              (throw (ex-info (or (:cause e) (str "Null cause from instance: " instance))
                              (assoc ex-d
                                     :instance instance
                                     :flow-urls (read-flow-urls flow-api))))
              (throw e))))))))
