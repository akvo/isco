(ns akvo.isco.handler.roles
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [duct.logger :as log]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]))

(defmethod ig/init-key :akvo.isco.handler.roles/handler [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (log/info logger (-> config :roles))
    (let [roles (:roles config)]
      (resp/response (mapv (fn [[k v ]]
                             (merge {:key (name k)} v)) roles)))))
