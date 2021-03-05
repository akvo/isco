(ns akvo.rsr-api
  (:require
   [akvo.lumen.http.client :as http.client]
   [clojure.java.io :as io]
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

(defn new-project [token parent-project-id {:keys [title subtitle date-start-planned]}]
  (let [project-body (-> (http.client/post*
                          (format "%sv1/program/%s/add-project/?format=json" host parent-project-id)
                          (merge http-client-req-defaults
                                 {:headers {:Authorization (str "Token " dev/rsr-token)}
                                  :as :json
                                  :form-params {}
                                  :content-type :json}))
                         :body)
        new-project-id (:id project-body)]
    (-> (http.client/patch*
         (format "%sv1/project/%s/?format=json" host new-project-id)
         (merge http-client-req-defaults
                {:headers {:Authorization (str "Token " token)}
                 :as :json
                 :form-params (merge
                               ;; general information
                               {:title title
                                :subtitle subtitle
                                :status_label "Implementation"
                                :status "A"
                                :date_start_planned date-start-planned}
                               ;; descriptions
                               {:project_plan_summary "project plan summary description"}
                               )
                 :content-type :json}))
        :body
        (select-keys [:title :subtitle]))

    ;; partners & user access
    (let [partnership-id (-> (http.client/get*
                              (format "%sv1/partnership/?project=%s&format=json" host new-project-id)
                              (merge http-client-req-defaults
                                     {:headers {:Authorization (str "Token " token)}
                                      :as :json}))
                             :body
                             :results
                             first
                             :id)]

      (-> (http.client/patch*
           (format "%sv1/partnership/%s/?format=json" host partnership-id)
           (merge http-client-req-defaults
                  {:headers {:Authorization (str "Token " token)}
                   :as :json
                   :form-params {:organisation 42
                                 :organisation_name "Akvo"}
                   :content-type :json}))
          :body)
      )
    ;; finance
    (let [budget-id (-> (http.client/post*
                         (format "%sv1/budget_item/?format=json" host)
                         (merge http-client-req-defaults
                                {:headers {:Authorization (str "Token " dev/rsr-token)}
                                 :as :json
                                 :form-params {:label 18
                                               :project new-project-id }
                                 :content-type :json}))
                        :body :id)]

      (-> (http.client/patch*
           (format "%sv1/budget_item/%s/?format=json" host budget-id)
           (merge http-client-req-defaults
                  {:headers {:Authorization (str "Token " token)}
                   :as :json
                   :form-params {:amount 1}
                   :content-type :json}))
          :body)
      )
    ;; location
    (let [location-id (-> (http.client/post*
                           (format "%sv1/project_location/?format=json" host)
                           (merge http-client-req-defaults
                                  {:headers {:Authorization (str "Token " dev/rsr-token)}
                                   :as :json
                                   :form-params {:administratives []
                                                 :location_target new-project-id }
                                   :content-type :json}))
                          :body :id)]

      (-> (http.client/patch*
           (format "%sv1/project_location/%s/?format=json" host location-id)
           (merge http-client-req-defaults
                  {:headers {:Authorization (str "Token " token)}
                   :as :json
                   :form-params {:latitude 52.3675734,
                                 :longitude 4.9041389,
                                 :city "Amsterdam, Netherlands",
                                 :country_iso_code "NL"}
                   :content-type :json}))
          :body)
      )
    ;; image
    (-> (http.client/patch*
         (format "%sv1/project/%s/?format=json" host new-project-id)
         (merge http-client-req-defaults
                {:headers {:Authorization (str "Token " dev/rsr-token)}
                 :as :json
                 :multipart [
                             {:name "Content-Type" :content "image/png"}
                             {:name "filename" :content "pict.png"}
                             {:name "current_image"
                              :content (io/file "./resources/pict.png")}]}))
        :body
        :current_image)
    ;; publish
    (-> (http.client/patch*
         (format "%sv1/publishing_status/%s/?format=json" host (:publishing_status_id project-body))
         (merge http-client-req-defaults
                {:headers {:Authorization (str "Token " token)}
                 :as :json
                 :form-params {:status "published"}
                 :content-type :json}))
        :body)))
