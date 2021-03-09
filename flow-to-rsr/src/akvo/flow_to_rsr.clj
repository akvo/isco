(ns akvo.flow-to-rsr
  (:require
   [akvo.rsr-api :as rsr-api]
   [akvo.flow :as flow]
   [clojure.walk :as w]
   [akvo.rsr :as rsr]
   [cheshire.core :as cheshire]
   [clojure.tools.logging :as log]
   [clojure.pprint :refer (pprint)]))

(comment "...."
         (let [parent-program      9274
               parent-project-id   (-> (rsr-api/new-project dev/rsr-token parent-program {:title              "Dynamic secretariat tuesday bis"
                                                                                          :subtitle           "dynamically generated def"
                                                                                          :date-start-planned "2021-03-05"})
                                       :project)
               ;; creating dynamically sub-projects based on flow form submissions data
               rsr-projects-result (->>
                                    (:rows (flow/get-data (flow/source ...)
                                                          (flow/import-config )))
                                    (mapv (fn [submission]
                                            (let [title       (get-in submission [:groups "120020001" 0 "c118010001"])
                                                  instance-id (get-in submission [:metadata :instance_id]) ]
                                              {:title          title
                                               :instance-id    instance-id
                                               :rsr-project-id (let [new-project-data {:title              title
                                                                                       :subtitle           "dynamically generated"
                                                                                       :date-start-planned "2021-03-05"}]
                                                                 (try
                                                                   (-> (rsr-api/new-project dev/rsr-token
                                                                                            parent-project-id
                                                                                            new-project-data)
                                                                       :project)
                                                                   (catch Exception e (log/error e new-project-data))))}))))]
           (log/error :parent-project-id parent-project-id)
           (pprint rsr-projects-result)
           )

         (def qualitative-mapping {:rsr-indicator-id 121262
                                   :flow {:group-id 128030002
                                          :column-id 122010001}})

         (def quantitative-mapping {:rsr-indicator-id 121351
                                    :flow {:group-id 122010005
                                           :column-id 120030005}})

         (def mappings [qualitative-mapping quantitative-mapping])

         (let [parent-project-id 9406
               user-id 45824]
           (->>
            (:rows (flow/get-data (flow/source ... )
                                  (flow/import-config ...)))
            (mapv (fn [submission]
                    (mapv (fn [mapping]
                            (let [group-id (-> mapping :flow :group-id str)
                                  column-id (format "c%s" (-> mapping :flow :column-id))
                                  flow-value (get-in submission [:groups group-id 0 column-id])
                                  rsr-project-id (:rsr-project-id (first (filter #(= (get-in submission [:metadata :instance_id])
                                                                                     (:instance-id %)) dev/rsr-projects-result)))
                                  rsr-indicator-id (-> mapping :rsr-indicator-id)
                                  hierarchy-dicts (rsr/gen-hierarchy-dicts (rsr/hierarchy parent-project-id dev/rsr-projects-result) dev/rsr-token)
                                  indicator (rsr/indicator-per-project (:indicators hierarchy-dicts) rsr-indicator-id rsr-project-id)]
                              (try
                                #_(log/error hierarchy-dicts)
                                #_(log/error rsr-indicator-id rsr-project-id)
                                (log/error :trying flow-value indicator)
                                (rsr/write-indicator-period-value dev/rsr-token user-id indicator flow-value)
                                (catch Exception e (log/error e)))))
                          mappings))))))
