(ns dev
  (:refer-clojure :exclude [test])
  (:require [clojure.repl :refer :all]
            [clojure.tools.namespace.repl :refer [refresh]]
            [clojure.java.io :as io]
            [duct.core :as duct]
            [duct.core.repl :as duct-repl]
            [ragtime.core :as ragtime]
            [clojure.data.json :as json]
            [akvo.isco.db]
            [ragtime.jdbc :as jdbc]
            [duct.logger :as logger]
            [akvo.isco.db.verify-token :as db.token]
            [akvo.isco.utils :as isco.u]
            [akvo.isco.time :as isco.t]
            [ragtime.repl :as rragtime]
            [eftest.runner :as eftest]
            [integrant.core :as ig]
            [integrant.repl :refer [clear halt go init prep reset]]
            [integrant.repl.state :refer [config system]]
            [clojure.string :as str]
            [clj-time.core :as t]
            [clj-time.coerce :as tc])
  (:import [java.util UUID]))

(defn json>clj [json]
  (json/read-str json :key-fn keyword))

(isco.u/uuid)

(comment
  (db.token/all-tokens (dev/db))
  (t/within? (t/interval
              (t/minus (t/now) (t/hours 2)) (t/now))
             (tc/from-date(:created (first (db.token/token-by-user (dev/db) {:id 5})))))




  )

(duct/load-hierarchy)

(defn read-config []
  (duct/read-config (io/resource "akvo/isco/config.edn")))

(defn test []
  (eftest/run-tests (eftest/find-tests "test")))

(def profiles
  [:duct.profile/dev :duct.profile/local])

(clojure.tools.namespace.repl/set-refresh-dirs "dev/src" "src" "test")

(when (io/resource "local.clj")
  (load "local"))

(integrant.repl/set-prep! #(duct/prep-config (read-config) profiles))
#_(ragtime/rollback  {:db-spec (:datasource (:spec (:duct.database.sql/hikaricp system)))}  (last (first (:duct.migrator/ragtime system))))

(defn db []
  (:spec (:duct.database.sql/hikaricp system)))

(comment
 (def configo
   {:datastore  (jdbc/sql-database (:duct.database.sql/hikaricp config))
    :migrations (:duct.migrator.ragtime/resources system)})
 (refresh)
 (go)
 (rragtime/rollback configo)
 (rragtime/migrate configo)

 )
(comment
  (logger/log  (:duct.logger/timbre system) :info  :asas)

  )

;;(keys system)

(comment

  (json>clj "{\"user_id\":50,\"organization_id\":74,\"form_id\":111890828,\"form_instance_id\":\"idh\",\"form_instance_url\":\"idh\\/111890828\\/13b336fd-cc2b-431c-9c29-0aad3a781858\",\"submitted\":false,\"uuid\":null,\"display_name\":null,\"updated_at\":\"2021-04-05T08:34:25.000000Z\",\"id\":37}")
  )
