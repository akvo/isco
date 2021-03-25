(ns akvo.isco.handler.submission
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [duct.logger :as log]
            [clojure.pprint :refer (pprint)]
;;            [cheshire.core :as json]
            ))

(defmethod ig/init-key :akvo.isco.handler.submission/check [_ {:keys [db logger]}]
  (fn [{{{:keys [id]} :path} :parameters :as req}]
    (log/info logger {:akvo.isco.handler.submission/check id})
    (resp/response (mapv str [150981538 113130042 105640815]))))

(defmethod ig/init-key :akvo.isco.handler.submission/check-form [_ {:keys [db logger]}]
  (fn [{{{:keys [id form-id]} :path} :parameters :as req}]
    (log/info logger {:akvo.isco.handler.submission/check-form [id form-id] })
    (resp/response {:counts nil, :max_submission false, :submissions [], :users []})))
