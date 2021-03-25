(ns akvo.isco.utils.dev-emailer
  (:require [akvo.isco.protocols :as p]
            [duct.logger :as log]
            [clojure.data.json :as json]
            [integrant.core :as ig]))


(defrecord DevEmailer [store logger]
  p/SendEmail
  (send-email [this recipients email]
    (swap! store #(conj % {:email email
                           :recipients recipients}))
    (log/warn logger recipients)
    (log/warn logger  email)))

(defmethod ig/init-key :akvo.isco.utils.dev-emailer/emailer  [_ {:keys [from-email from-name logger] :as opts} ]
  (log/info  logger "Using std out emailer" opts)
  (map->DevEmailer (assoc opts :store (atom []))))
