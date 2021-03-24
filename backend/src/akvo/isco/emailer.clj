(ns akvo.isco.emailer
  (:require [akvo.isco.http.client :as http.client]
            [clojure.data.json :as json]
            [akvo.isco.protocols :as p]
            [integrant.core :as ig]))

(def http-client-req-defaults (http.client/req-opts 5000))

(defrecord MailJetV3Emailer [config]
  p/SendEmail
  (send-email [{{credentials :credentials
                 from-email  :from-email
                 from-name   :from-name} :config}
               recipients
               email]
    (let [body (merge email
                      {"FromEmail"  from-email
                       "FromName"   from-name
                       "Recipients" (into []
                                          (map (fn [email] {"Email" email})
                                               recipients))})]
      (http.client/post* "https://api.mailjet.com/v3/send"
                         (merge http-client-req-defaults
                                {:basic-auth credentials
                                 :headers    {"Content-Type" "application/json"}
                                 :body       (json/write-str body)})))))

(defmethod ig/init-key :akvo.isco.emailer/mailjet-v3-emailer  [_ {:keys [email-password email-user from-email from-name]}]
  (map->MailJetV3Emailer
   {:config {:credentials [email-user email-password]
             :from-email  from-email
             :from-name   from-name}}))
