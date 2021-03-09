(ns akvo.rsr
  (:require
   [clojure.walk :as w]
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

(defn indicator-type [indicator]
  (if (= 1 (:type indicator))
    :quantitative
    :qualitative))

(defn write-indicator-period-value [token user-id indicator value]
  (let [indicator-type* (indicator-type indicator)
        period-id (:id (last (:periods indicator)))]
   (if (= :quantitative (indicator-type indicator))
     (when value
       (rsr-api/write-indicator-period-value token user-id period-id indicator-type* value))
     (let [score-value (.indexOf (:scores indicator) value)]
       (when (>= score-value 0)
         (rsr-api/write-indicator-period-value token user-id period-id indicator-type* (inc score-value)))))))

(defn- fill-hierarcy-dict [kw parent-rel items atom-dict-coll]
  (let [parent-kw (keyword (str "parent_" (name kw)))](doseq [indicator items]
           (let [r (->>  @atom-dict-coll
                         (filter #(= (parent-kw indicator)
                                     (% :id)))
                         (map parent-kw))
                 parent-indicators (vec (conj r (parent-kw indicator)))
                 indicator* (assoc (merge indicator parent-rel)
                                   (keyword (str "parent-" (name kw) "s")) parent-indicators)]
             (swap! atom-dict-coll conj indicator*)))))

(defn gen-hierarchy-dicts [hierarchy rsr-token]
  (let [periods-dict (atom [])
        indicators-dict (atom [])]
    (w/postwalk (fn [hierarchy-item]
                  (if (number? hierarchy-item)
                    (fill-hierarcy-dict :indicator {:project-id hierarchy-item} (project-indicators rsr-token hierarchy-item) indicators-dict)
                    hierarchy-item)) hierarchy)
    (doseq [indicator @indicators-dict]
      (fill-hierarcy-dict :period {:indicator-id (:id indicator)} (:periods indicator) periods-dict))
    {:indicators @indicators-dict
     :periods @periods-dict}))

(defn indicator-per-project
  "find project indicator by parent-project indicator-id"
  [indicators-dict parent-indicator-id subproject-id]
  (first (filter #(and (contains? (set (:parent-indicators %)) parent-indicator-id)
                       (= subproject-id (:project-id %))) indicators-dict)))

(defn hierarchy [parent-project rsr-projects-result]
  {9274 {parent-project (reduce #(assoc % (:rsr-project-id %2) {}) {} rsr-projects-result)}})
