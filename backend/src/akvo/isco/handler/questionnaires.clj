(ns akvo.isco.handler.questionnaires
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [duct.logger :as log]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]))

(defmethod ig/init-key :akvo.isco.handler.questionnaires/handler [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
;;    (log/debug logger (:questionnaires config))
    (resp/response (:questionnaires config))))
