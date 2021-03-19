(ns akvo.isco.utils
  (:require [clojure.string :as str])
  (:import [java.util UUID]))

(defn uuid [] (str/replace (str (UUID/randomUUID)) "-" "_"))
