(defproject org.akvo/flow-to-rsr "0.1.0-SNAPSHOT"
  :description "PoC: reading data from akvo-flow then send it to akvo-rsr using copy-pasted logic from akvo-lumen"
  :url "TODO"
  :license {:name "GNU Affero General Public License 3.0"
            :url "https://www.gnu.org/licenses/agpl-3.0.html"}
  :dependencies [[com.stuartsierra/component "0.3.2"]
                 ;;[clojurewerkz/scrypt "1.2.0"]
                 [ch.qos.logback/logback-classic "1.2.3"]
                 [tangrammer/tools.logging "0.4.1"]
                 [org.slf4j/log4j-over-slf4j "1.7.26" :exclusions [org.slf4j/slf4j-api]]
                 [org.slf4j/jcl-over-slf4j "1.7.26" :exclusions [org.slf4j/slf4j-api]]
                 [org.slf4j/jul-to-slf4j "1.7.26" :exclusions [org.slf4j/slf4j-api]]
                 [cheshire "5.9.0" :exclusions [com.fasterxml.jackson.core/jackson-core]]
                 [clj-http "3.10.0" :exclusions [org.apache.httpcomponents/httpcore org.apache.httpcomponents/httpclient org.apache.httpcomponents/httpmime commons-io/commons-io]]
                 [clj-time "0.15.1"]
                 ;;                 [com.layerware/hugsql "0.4.9"]
                 [commons-io/commons-io "2.6"]
                 ;;                 [compojure "1.6.1" :exclusions [medley]]
                 [diehard "0.8.3" :exclusions [org.clojure/spec.alpha org.clojure/clojure org.clojure/core.specs.alpha]]
                 ;;                 [duct/core "0.7.0" :exclusions [org.clojure/clojure]]
                 ;;                 [duct/module.logging "0.4.0" :exclusions [org.clojure/spec.alpha org.clojure/clojure org.clojure/core.specs.alpha com.stuartsierra/dependency]]
                 ;;                 [duct/database.sql.hikaricp "0.4.0" :exclusions [org.clojure/spec.alpha org.slf4j/slf4j-nop org.clojure/clojure integrant org.clojure/core.specs.alpha]]
                 ;;                 [environ "1.1.0"]
                 [funcool/cuerdas "2.2.0" :exclusions [org.clojure/spec.alpha com.google.protobuf/protobuf-java com.google.errorprone/error_prone_annotations org.clojure/clojure com.google.guava/guava org.clojure/core.specs.alpha com.google.code.findbugs/jsr305 org.clojure/tools.reader]]
                 ;;                 [honeysql "0.9.4"]
                 ;;                 [meta-merge "1.0.0"]
                 ;;                 [metosin/reitit "0.3.7" :exclusions [com.cognitect/transit-java org.clojure/spec.alpha org.ow2.asm/asm ring/ring-core mvxcvi/puget org.clojure/clojure ring/ring-codec org.clojure/core.rrb-vector mvxcvi/arrangement fipp r org.clojure/core.specs.alpha com.cognitect/transit-clj com.fasterxml.jackson.core/jackson-databind com.fasterxml.jackson.core/jackson-core]]
                 [org.akvo/commons "0.4.6" :exclusions [org.postgresql/postgresql org.clojure/java.jdbc]]
                 [org.akvo/resumed "1.46.266acfa5bb52c9b484af19f0bcfbfacb60b97319"]
                 ;;                 [org.apache.tika/tika-core "1.21"]
                 ;;                 [org.apache.tika/tika-parsers "1.21" :exclusions [org.slf4j/slf4j-api com.fasterxml.jackson.core/jackson-core org.apache.httpcomponents/httpcore org.apache.httpcomponents/httpclient org.apache.httpcomponents/httpmime commons-io/commons-io]]
                 ;; explicit versions of commons deps used by tika-parsers and clj-http
                 [com.fasterxml.jackson.core/jackson-core "2.9.9"]
                 [org.apache.httpcomponents/httpcore "4.4.11"]
                 [org.apache.httpcomponents/httpclient "4.5.8"]
                 [org.apache.httpcomponents/httpmime "4.5.8"]
                 [org.clojure/clojure "1.10.1"]
                 ;;                 [org.clojure/data.csv "0.1.4"]
                 [org.clojure/core.match "0.3.0"]
                 [org.clojure/java.jdbc "0.7.9"]
                 ;;                 [org.immutant/web "2.1.10" :exclusions [ch.qos.logback/logback-classic]]
                 [org.postgresql/postgresql "42.2.5"]


                 ;;                 [ragtime "0.7.2"]
                 ;;                 [raven-clj "1.6.0"]
                 ;;                 [ring "1.7.1" :exclusions [ring/ring-core]]
                 ;;                 [ring/ring-core "1.7.1" :exclusions [ring/ring-codec]]
                 ;;                 [ring/ring-defaults "0.3.2"]
                 ;;                 [ring/ring-json "0.4.0"]
                 ;;                 [selmer "1.12.12" :exclusions [com.fasterxml.jackson.dataformat/jackson-dataformat-smile com.fasterxml.jackson.dataformat/jackson-dataformat-cbor cheshire]]
                 [net.postgis/postgis-jdbc "2.3.0" :exclusions [org.postgresql/postgresql]]
                 ;;                 [iapetos "0.1.8" :exclusions [io.prometheus/simpleclient]]
                 ;;                 [io.prometheus/simpleclient_hotspot "0.6.0"]
                 ;;                 [io.prometheus/simpleclient_dropwizard "0.6.0"]
                 ;;                 [org.clojure/test.check "0.10.0-alpha3"]

                 ;; added this dep to be able to run with java > 1.8
                 [javax.xml.bind/jaxb-api "2.4.0-b180830.0359"]

                 ]
  :profiles {:dev {:dependencies [[org.clojure/tools.namespace "0.2.11"]
                                  [com.stuartsierra/component.repl "0.2.0"]]
                   :source-paths ["dev"]
                   :repl-options {:init-ns dev
                                  :init (do
                                          (println "Starting BackEnd ...")
                                          #_(go)
                                          (migrate-and-seed))
                                  :host "0.0.0.0"
                                  :port 47480}}})
