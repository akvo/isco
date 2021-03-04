(ns akvo.rsr
  (:require
   [akvo.rsr-api :as rsr-api]))

(defn me [token]
  (-> (rsr-api/me token)
      :body
      (select-keys [:email :id])))

(defn project-indicators [token project-id]
  (->>
   (rsr-api/read-indicators token project-id)
   :body :results first :indicators
   (mapv
    (fn [indicator]
      (let [data (select-keys indicator [:id :title :parent_indicator :type :scores :periods])]
        (update data :periods
                (fn [periods]
                  (mapv
                   (fn [period]
                     (let [p (select-keys period [:parent_period :id :period_start :period_end :updates])]
                       (update p :updates
                               (fn [updates]
                                 (mapv (fn [u]
                                         (assoc (select-keys u [:value :id :created_at])
                                                :email (-> u :user_details :email)
                                                )) updates))))) periods))))))))
