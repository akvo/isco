(ns akvo.lumen.lib.import.flow-v4
  (:require [akvo.lumen.lib.import.common :as common]
            [akvo.lumen.util :as util]
            [clojure.string :as string]
            [clojure.tools.logging :as log]
            [clojure.walk :as w]
            [akvo.lumen.lib.import.flow-common :as flow-common]
            [akvo.lumen.lib.import.flow-v3 :as v3])
  (:import [java.time Instant]))

(defn render-response [iteration container {:keys [type id derived-id derived-fn] :as question}]
  (if-let [response ((or derived-fn identity) (get iteration (or derived-id id)))]
    (assoc container (format "c%s" id) (v3/render-response type response))
    container))

;; {question-group-id -> [{question-id -> response}]

;; {:group-id [{:question-a "x"
;;              :question-b "y"}]
;;  :r-group-id [{:question1 1
;;                :question2 2}
;;               {:question1 11
;;                :question2 22}]}

(defn response-data
  [form responses]
  (reduce (fn [c [group-id iterations]]
            (let [updated-iterations (map (fn [iteration]
                                            (reduce (partial render-response iteration)
                                                    {}
                                                    (v3/flow-questions form)))
                                          iterations)]
              (assoc c group-id updated-iterations)))
          {}
          responses))

(defn form-data
  "First pulls all data-points belonging to the survey. Then map over all form
  instances and pulls additional data-point data using the forms data-point-id."
  [headers-fn instance survey form-id]
  (let [form (flow-common/form survey form-id)
        data-points (util/index-by "id"
                                   (flow-common/data-points headers-fn survey))]
    (map (fn [form-instance]
           (let [data-point-id (get form-instance "dataPointId")]
             (if-let [data-point (get data-points data-point-id)]
               (let [metadata-common-records (flow-common/common-records form-instance data-point)
                     form-instance-id (select-keys metadata-common-records [:instance_id])]
                (merge (let [data (response-data form (get form-instance "responses"))]
                         (reduce (fn [c [group-id iterations]]
                                   (assoc c group-id (mapv (partial merge form-instance-id) iterations)))
                                 {} data))
                       {"metadata" [(merge metadata-common-records
                                           {:device_id (get form-instance "deviceIdentifier")})]}))
               (throw (ex-info "Flow form (dataPointId) referenced data point not in survey"
                               {:form-instance-id (get form-instance "id")
                                :data-point-id data-point-id
                                :instance instance
                                :survey-id (:id survey)})))))
         (flow-common/form-instances headers-fn form))))
