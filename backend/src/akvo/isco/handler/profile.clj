(ns akvo.isco.handler.profile
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [clojure.java.jdbc :as jdbc]
            [akvo.isco.time :as it]
            [akvo.isco.protocols :as p]
            [clojure.string :as str]
            [duct.logger :as log]
            [akvo.isco.db.user :as db.user]
            [akvo.isco.utils :as iu]
            [akvo.isco.db.verify-token :as db.verify-token]))

(defmethod ig/init-key :akvo.isco.handler.profile/me [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (log/info logger :jwt-claims jwt-claims)
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.user/user-by-email conn jwt-claims)
            email_verified (boolean (:email_verified_at user))]
        (resp/response (assoc (select-keys jwt-claims [:name :email])
                              :organization_id (:organization_id user)
                              :email_verified email_verified
                              :permissions (-> config :roles :admin :permissions)
                              :project_fids (-> config :webform :forms :project :fids)))))))

(defmethod ig/init-key :akvo.isco.handler.profile/saved-surveys-handler [_ {:keys [logger db]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (resp/response {:data
                    [{:web_form_id 33,
                      :url
                      "https://tech-consultancy.akvotest.org/akvo-flow-web/idh/105640815/b9a9f96f-a5af-4b55-93f8-00e8a575f8d5",
                      :survey_name "C - Retail",
                      :submitter "juan@akvo.org",
                      :submission_name nil,
                      :org_name "staff GISCO secretariat",
                      :org_id 74,
                      :date "2021-03-22T10:31:16.000000Z"}],
                    :last_activity "2021-03-22T10:31:25.731110Z"})))

(defmethod ig/init-key :akvo.isco.handler.profile/surveys [_ {:keys [config logger db]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.user/user-by-email conn jwt-claims)]
        (resp/response {:data
                        (mapv (partial iu/find-questionnaire (:questionnaires config)) (:questionnaires user))
                        :last_activity "2021-03-22T10:31:25.731110Z"})))))

(def post-params
  [:map
   [:name string?]
   [:email string?]
   [:agreement boolean?]
   [:organization_id int?]])

(defmethod ig/init-key :akvo.isco.handler.profile/register-post-params [_ _]
  post-params)

(defn validate-url [register-url token]
  (str (str/replace register-url "register" "validate-email/token=") token))

(defmethod ig/init-key :akvo.isco.handler.profile/register [_ {:keys [db logger config emailer]}]
  (fn [{:keys [body-params] :as req}]
    (let [new-token (iu/uuid)
          validate-url (validate-url (get-in req [:headers "referer"]) new-token)]
      (log/error logger {::new-token new-token })
     (jdbc/with-db-transaction [conn (:spec db)]
       (log/info logger {::params body-params ::headers (get-in req [:headers])})
       (if (:agreement body-params)
         (if-let [existent-user (db.user/user-by-email conn body-params)]
           (do
             (log/warn logger {:existent-user existent-user})
             (db.verify-token/new-token conn {:id new-token :user_id (:id existent-user)})
             (p/send-email emailer [(:email existent-user) ] {:url validate-url})
             (resp/created (get-in req [:headers "referer"]) {:message "New token created" })
             )
           (let [new-user (db.user/new-user conn body-params)]
             (db.verify-token/new-token conn {:id new-token :user_id (:id new-user)})
             (log/error logger {::new-user new-user})
             (p/send-email emailer [(:email new-user) ] {:url validate-url})
             (resp/created (get-in req [:headers "referer"]) {:message "New user created" })))
         (resp/bad-request {:error "missing agreement"}))))))

(defn validate! [db token email]
  (when (it/valid-within? (:created token) 1)
    (boolean (db.user/validate-user db {:email email}))))


(defmethod ig/init-key :akvo.isco.handler.profile/validate-email [_ {:keys [db]}]
  (fn [{{{:keys [token]} :query} :parameters}]
    (if token
      (jdbc/with-db-transaction [conn (:spec db)]
        (if-let [existent-token (db.verify-token/token-by-id conn {:id token})]
          (if-let [user (db.user/user-by-id conn {:id (:user_id existent-token)})]
            (if (or (:email_verified_at user) (validate! conn existent-token (:email user)))
              (resp/response {:token-verified true})
              (resp/bad-request {:error "invalid token"}))
            (resp/bad-request {:error "missing user token related"}))
          (resp/bad-request {:error "missing token"})))
      (resp/bad-request {:error "missing token"}))))
