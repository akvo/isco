(ns akvo.flow-to-rsr
  (:require
   [akvo.rsr-api :as rsr-api]
   [akvo.flow :as flow]
   [akvo.rsr :as rsr]
   [cheshire.core :as cheshire]
   [clojure.tools.logging :as log]))

(comment "flow part"
  (let [jwt-token dev/jwt]
    (flow/execute (flow/source "uat1" "722939140" "713029131" "juan@akvo.org" jwt-token)
             (flow/import-config "https://api-auth0.akvotest.org/flow"))))

(comment "rsr part"
         (rsr/me dev/rsr-token)
         {:id 9247, :status "published", :project 9309}
         (rsr-api/new-project dev/rsr-token 9274 {:title "Dynamic secretariat"
                                                  :subtitle "dynamically generated"
                                                  :date-start-planned "2021-03-05"})

         (->>
          (:rows (flow/get-data (flow/source "isco" "112020049" "120020050" "juan@akvo.org" dev/jwt)
                                (flow/import-config "https://api-auth0.akvo.org/flow")))
          (mapv (fn [submission]
                  (let [title (-> submission :metadata :display_name)]
                    {:title title
                     :rsr-project-id (-> (rsr-api/new-project dev/rsr-token 9309 {:title title
                                                                                  :subtitle "dynamically generated"
                                                                                  :date-start-planned "2021-03-05"})
                                         :project)}))))


  (let [rsr-api-token dev/rsr-token]
    (rsr/project-indicators dev/rsr-token 9269)
    #_(let [id 32771]
        (log/error :current-value-for id
                   (-> (rsr-api/read-indicator-period-data-framework rsr-api-token id)
                       :body
                       :value)))
    #_(let [user-id 45824
            period-id 435305
            value (+ 10 (rand-int 100))]
        (log/error :writing-value
                   (rsr-api/write-indicator-period-data rsr-api-token user-id period-id value)))
    )



  (def mapping {"c732649139" 121258
                "c739539130" 121257}))
