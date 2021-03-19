(ns akvo.isco.time
  (:require [clj-time.core :as t]
            [clj-time.coerce :as tc]))


(defn valid-within? [inst-time mins]
  (t/within? (t/interval
              (t/minus (t/now) (t/hours 2)) (t/now))
             (tc/from-date inst-time)))
