(ns akvo.flow-to-rsr
  (:require
   [akvo.rsr-api :as rsr-api]
   [akvo.flow :as flow]
   [clojure.walk :as w]
   [akvo.rsr :as rsr]
   [cheshire.core :as cheshire]
   [clojure.tools.logging :as log]))

(comment "flow part"
  (let [jwt-token dev/jwt]
    (flow/execute (flow/source "uat1" "722939140" "713029131" "juan@akvo.org" jwt-token)
             (flow/import-config "https://api-auth0.akvotest.org/flow"))))
(comment "create cacao projects dynamically based on flow data"
         (let [parent-project-id 9336]
           (->>
            (:rows (flow/get-data (flow/source "isco" "114020001" "112020001" "juan@akvo.org" dev/jwt)
                                  (flow/import-config "https://api-auth0.akvo.org/flow")))
            (mapv (fn [submission]
                    (let [title (get-in submission [:groups "120020001" 0 "c118010001"])
                          instance-id (get-in submission [:metadata :instance_id]) ]
                      {:title title
                       :instance-id instance-id
                       :rsr-project-id (-> (rsr-api/new-project dev/rsr-token parent-project-id {:title title
                                                                                                 :subtitle "dynamically generated"
                                                                                                 :date-start-planned "2021-03-05"})
                                           :project)})))))



         )


(comment "rsr part"
         (rsr/me dev/rsr-token)
         {:id 9274, :status "published", :project 9336}
         (rsr-api/new-project dev/rsr-token 9274 {:title "Dynamic secretariat def"
                                                  :subtitle "dynamically generated def"
                                                  :date-start-planned "2021-03-05"})



         dev/hierarchy


         (def indicators-dict (let [dict (atom [])]
                                (w/postwalk (fn [k]
                                              (if (number? k)
                                                (let [indicators (->> (rsr/project-indicators dev/rsr-token k)
                                                                      (mapv (fn [i]
                                                                              (assoc i :project-id k
                                                                                     :parent_indicators (let [r (->> (flatten @dict)
                                                                                                                     (filter #(= (:parent_indicator i)
                                                                                                                                 (% :id)))
                                                                                                                     (map :parent_indicator))]
                                                                                                          (vec (conj r (:parent_indicator i))))))))]
                                                  (swap! dict conj  indicators))
                                                k)) dev/hierarchy)
                                (vec (flatten @dict))))

         (defn indicator-per-project [parent-indicator-id subproject-id]
           (let [parent-program 9274]
             (first (filter #(and (contains? (set (:parent_indicators %)) parent-indicator-id ) (= subproject-id (:project-id %))) indicators-dict))))

         (def qualitative-mapping {:rsr-indicator-id 121262
                                   :flow {:group-id 128030002
                                          :column-id 122010001}})

         (def quantitative-mapping {:rsr-indicator-id 121351
                                    :flow {:group-id 122010005
                                           :column-id 120030005}})

         (def mappings [qualitative-mapping quantitative-mapping])

         (let [parent-project-id 9336]
           (->>
            (:rows (flow/get-data (flow/source "isco" "114020001" "112020001" "juan@akvo.org" dev/jwt)
                                  (flow/import-config "https://api-auth0.akvo.org/flow")))
            (mapv (fn [submission]
                    (mapv (fn [mapping]
                            (let [group-id (-> mapping :flow :group-id str)
                                  column-id (format "c%s" (-> mapping :flow :column-id))
                                  flow-value (get-in submission [:groups group-id 0 column-id])
                                  rsr-project-id (:rsr-project-id (first (filter #(= (get-in submission [:metadata :instance_id])
                                                                                     (:instance-id %)) rsr-projects-result)))
                                  rsr-indicator-id (-> mapping :rsr-indicator-id)
                                  indicator (indicator-per-project rsr-indicator-id rsr-project-id)]
                              (try
                                (log/error :trying flow-value indicator)
                                (rsr/write-indicator-period-value dev/rsr-token 45824 indicator flow-value)
                                (catch Exception e (log/error e)))))
                          mappings)))))







)

