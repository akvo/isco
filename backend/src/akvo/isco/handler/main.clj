(ns akvo.isco.handler.main
  (:require [integrant.core :as ig]
            [malli.util :as mu]
            [muuntaja.core :as m]
            [reitit.coercion.malli]
            [reitit.ring :as ring]
            [reitit.ring.coercion :as coercion]
            [ring.middleware.cors :refer (wrap-cors)]
            [reitit.ring.middleware.exception :as exception]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.ring.middleware.parameters :as parameters]
            [reitit.swagger :as swagger]
            [reitit.swagger-ui :as swagger-ui]
            [ring.util.response :as resp]))


(defn root
  [_]
  (resp/response {:status "OK"}))


(defn router
  [routes]
  (ring/router
   routes
   {:data {:muuntaja m/instance

           :coercion (reitit.coercion.malli/create
                      {:error-keys #{:errors}
                       :compile mu/open-schema
                       :skip-extra-values true
                       :default-values true})

           :middleware [;; swagger feature
                        swagger/swagger-feature
                        ;; query-params & form-params
                        parameters/parameters-middleware
                        ;; content-negotiation
                        muuntaja/format-negotiate-middleware
                        ;; encoding response body
                        muuntaja/format-response-middleware
                        ;; exception handling
                        exception/exception-middleware
                        ;; decoding request body
                        muuntaja/format-request-middleware
                        ;; coercing response bodys
                        coercion/coerce-response-middleware
                        #(wrap-cors %
                                    :access-control-allow-origin [#"http://localhost:3002" #"http://tangrammer.local:3002" #"https://gisco-pilot.tc.akvo.org" #"https://gisco-demo.tc.akvo.org"]
                                   :access-control-allow-methods [:get :post])
                        ;; coercing request parameters
                        coercion/coerce-request-middleware]}}))

(defmethod ig/init-key :akvo.isco.handler.main/handler [_ {:keys [main-route auth-routes public-routes auth-middleware]}]
  (let [auth-routes-with-middleware (mapv (fn [route]
                                            (if (map? (second route))
                                              (update-in route [1 :middleware] #(apply conj % auth-middleware)) ;; Take care that we are
                                              (apply conj [(first route) {:middleware auth-middleware}] (subvec route 1)))) auth-routes)
        routes (conj main-route (apply conj ["api"] (apply conj
                                                           auth-routes-with-middleware
                                                           public-routes)))]
   (ring/ring-handler (router routes)
                      (ring/routes
                       (swagger-ui/create-swagger-ui-handler {:path "/api/docs"
                                                              :url "/api/swagger.json"
                                                              :validatorUrl nil
                                                              :operationsSorter "alpha"})
                       (ring/create-default-handler)))))

(defmethod ig/init-key :akvo.isco.handler.main/root [_ _]
  root)

(defmethod ig/init-key :akvo.isco.handler.main/swagger-handler [_ _]
  (swagger/create-swagger-handler))
