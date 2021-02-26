(ns akvo.rsr-api
  (:require
   [akvo.lumen.http.client :as http.client]
   [clojure.tools.logging :as log]))

(def ^:private http-client-req-defaults (http.client/req-opts 60000))

(defn read-indicator-period-data-framework [id token]
  (http.client/get*
   (format "https://rsr.test.akvo.org/rest/v1/indicator_period_data_framework/%s/?format=json" id)
   (merge http-client-req-defaults
          {:headers {:Authorization (str "Token " token)}
           :as :json})))
