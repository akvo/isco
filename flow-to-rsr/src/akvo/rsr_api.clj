(ns akvo.rsr-api
  (:require
   [akvo.lumen.http.client :as http.client]
   [cheshire.core :as json]
   [clojure.java.io :as io]
   [clojure.tools.logging :as log]))

(def ^:private http-client-req-defaults (http.client/req-opts 60000))

(def host "https://rsr.test.akvo.org/rest/")

(defn me [token]
  (-> (http.client/get*
       (format "%sv1/me/?format=json" host)
       (merge http-client-req-defaults
              {:headers {:Authorization (str "Token " token)}
               :as :json}))))

(defn read-indicators [token project-id]
  (http.client/get*
   (format "%sv1/project/%s/results_framework/?format=json" host project-id)
   (merge http-client-req-defaults
          {:headers {:Authorization (str "Token " token)}
           :as :json})))

(defn read-indicator-period-data-framework [token id]
  (http.client/get*
   (format "%sv1/indicator_period_data_framework/%s/?format=json" host id)
   (merge http-client-req-defaults
          {:headers {:Authorization (str "Token " token)}
           :as :json})))

(defn write-indicator-period-data [token user period value]
  (let [body {:status "A"
              :text "the comment of the value"
              :disaggregations []
              :value value
              :user user
              :period period}]
    (http.client/post*
     (format "%sv1/indicator_period_data_framework/?format=json" host)
     (merge http-client-req-defaults
            {:headers {:Authorization (str "Token " token)}
             :as :json
             :form-params body
             :content-type :json}))))
