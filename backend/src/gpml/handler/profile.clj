(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :as log]
            [gpml.db.user :as db.user]
            [clojure.pprint :refer (pprint)]))

(defmethod ig/init-key :gpml.handler.profile/me [_ {:keys [db logger config]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (log/info logger :jwt-claims jwt-claims)
    (resp/response (assoc (select-keys jwt-claims [:name :email :email_verified])
                          :organization_id 74
                          :permissions (-> config :roles :admin :permissions)
                          :project_fids (-> config :webform :forms :project :fids)
                          )


                   )))

(defmethod ig/init-key :gpml.handler.profile/saved-surveys-handler [_ {:keys [logger db]}]
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


(defmethod ig/init-key :gpml.handler.profile/surveys [_ {:keys [config logger]}]
  (fn [{:keys [jwt-claims] {{:keys [id]} :query} :parameters}]
    (resp/response {:data
                    (-> config :questionnaires),
                    :last_activity "2021-03-22T10:31:25.731110Z"})))



(def post-params
  [:map
   [:name string?]
   [:email string?]
   [:agreement boolean?]
   [:organization_id int?]])

(defmethod ig/init-key :gpml.handler.profile/register-post-params [_ _]
  post-params)

(defmethod ig/init-key :gpml.handler.profile/register [_ {:keys [db logger config]}]
  (fn [{:keys [body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [redirect (str/replace (get-in req [:headers "referer"]) "register" "login")]
            (log/info logger {:r redirect :m body-params} #_{:ref (:referrer req) :params body-params})
        (if (:agreement body-params)
          (do (db.user/new-user conn body-params)
              (resp/created (get-in req [:headers "referer"]) {:message "New user created"}))
          (resp/bad-request {:error "missing agreement"}))


        ))))
