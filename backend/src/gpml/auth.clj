(ns gpml.auth
  (:require [integrant.core :as ig]
            [malli.core :as malli]
            [clojure.pprint :refer (pprint)])
  (:import [com.auth0.jwk JwkProvider JwkProviderBuilder]
           [com.auth0.jwt JWT]
           [com.auth0.jwt.impl JsonNodeClaim]
           [com.auth0.utils.tokens SignatureVerifier PublicKeyProvider IdTokenVerifier]))

(def verifier-opts
  [:map
   [:issuer [:re #"^https://\S+/$"]]
   [:audience [:re #"^\S+$" ]]])

(defn validate-opts
  [opts]
  (or (malli/validate verifier-opts opts)
      (throw
       (ex-info "Invalid IdToken verifier options"
                (malli/explain verifier-opts opts)))))

(defn signature-verifier [issuer]
  (let [jwk-provider (-> issuer
                         (JwkProviderBuilder.)
                         (.build))
        public-key-provider (reify PublicKeyProvider
                              (getPublicKeyById [this key-id]
                                (.getPublicKey (.get ^JwkProvider jwk-provider key-id))))]
    (SignatureVerifier/forRS256 public-key-provider)))

(defn token-verifier [{:keys [issuer audience signature-verifier]}]
  (.build
   (IdTokenVerifier/init issuer
                         audience
                         signature-verifier)))

(defn get-claims
  [token]
  (reduce-kv (fn [m ^String k ^JsonNodeClaim v]
               (assoc m (keyword k) (case k
                                      "email_verified" (.asBoolean v)
                                      "iat" (.asDate v)
                                      "exp" (.asDate v)
                                      (.asString v))))
             {}
             (into {} (.getClaims (JWT/decode token)))))

(defmethod ig/prep-key :gpml.auth/auth-middleware [_ opts]
  (and (validate-opts opts)
       opts))

(defn check-authentication [request verify-fn]
  (if-let [auth-header (get-in request [:headers "authorization"])]
    (do
      (let [[_ token] (re-find #"^Bearer (\S+)$" auth-header)
            [valid? error-msg-or-claims] (verify-fn token)]
        (if valid?
         {:authenticated? true
          :jwt-claims error-msg-or-claims}
         {:authenticated? false
          :auth-error-message error-msg-or-claims
          :status 403})))
    {:authenticated? false
     :auth-error-message "Authentication required"
     :status 401}))

(defn id-token-verifier
  [signature-verifier opts]
  (fn [token]
    (let [id-token-verifier (token-verifier (assoc opts :signature-verifier signature-verifier))]
      (try
        (.verify ^IdTokenVerifier id-token-verifier token)
        [true (get-claims token)]
        (catch Exception e
          [false (.getMessage e)])))))

(defmethod ig/init-key :gpml.auth/auth-middleware [_ opts]
  (fn [handler]
;;    (println "auth-middleware0" opts)
    (let [signature-verifier (signature-verifier (:issuer opts))]
      (fn [request]
;;        (println "auth-middleware1")
;;        (pprint request)
        (handler (merge request (check-authentication request
                                                      (id-token-verifier signature-verifier
                                                                         opts))))))))


(defmethod ig/init-key :gpml.auth/auth-required [_ _]
  (fn [handler]
;;    (println "auth-required0")
    (fn [request]
;;      (println "auth-required1")
      (if (:authenticated? request)
        (handler request)
        {:status (:status request)
         :message (:auth-error-message request)}))))
