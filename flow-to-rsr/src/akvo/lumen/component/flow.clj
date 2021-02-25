(ns akvo.lumen.component.flow
  (:require [clojure.tools.logging :as log]
            [clojure.spec.alpha :as s]))

(def commons-api-headers
  {"User-Agent" "lumen"
   "Accept" "application/vnd.akvo.flow.v2+json"})

(defn api-headers
  "JWT token required thus the call could be used externally"
  [{:keys [token]}]
  (merge commons-api-headers {"Authorization" (format "Bearer %s" token)}))

(defn internal-api-headers
  "No authorization is required thus it's an internal owned k8s call"
  [{:keys [email]}]
  (merge commons-api-headers {"X-Akvo-Email" email}))
