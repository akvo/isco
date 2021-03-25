(ns akvo.isco.main
  (:gen-class)
  (:require [duct.core :as duct]
            [akvo.isco.db]))

(duct/load-hierarchy)

(defn -main [& args]
  (let [keys     (or (duct/parse-keys args) [:duct/migrator :duct/daemon])
        profiles [:duct.profile/prod]]
    (-> (duct/resource "akvo/isco/config.edn")
        (duct/read-config)
        (duct/exec-config profiles keys))))
