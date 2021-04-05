(ns akvo.isco.config
  (:require [integrant.core :as ig]))


(def roles {:admin {:permissions ["submit-survey" "manage-surveys" "manage-users"],
                    :name "Admin"
                    :key "admin"
                    :description nil},
            :submitter {:permissions ["submit-survey"],
                        :name "Submitter"
                        :key "submitter"
                        :description nil}})

"https://tech-consultancy.akvotest.org/akvo-flow-web"
(def akvo-flow-web-host "http://localhost:3002" )

(def data {:roles roles
           :webform-host akvo-flow-web-host
           :webform {:forms
                     {:project {:fids ["111510043" "143215090"
                                       ;; TODO: remove after testing
                                       "111890828"
                                       ], :max_submission nil},
                      :industry {:fids
                                 ["113130042"
                                  "105640815"
                                  "111890828"
                                  "134210832"
                                  "130990814"
                                  "143340791"
                                  "150700609"
                                  "148430590"
                                  "150981538"],
                                 :max_submission 1}},
                     :exception
                     {:organization {:name ["staff akvo" "staff gisco secretariat"], :ids []}},
                     :surveys {:project [{:survey_id 116680069,
                                          :form_id 111510043,
                                          :question
                                          {:dependency_to 124260137,
                                           :group 95530076,
                                           :repeatable true,
                                           :member 89980334,
                                           :contact_name 124680005,
                                           :contact_email 81610060,
                                           :comment 124750055}}]}}
           :questionnaires [{:url
                             (format "%s/idh/111510043" akvo-flow-web-host),
                             :title "Projects - GISCO",
                             :name "111510043"}
                            {:url
                             (format "%s/idh/113130042" akvo-flow-web-host),
                             :title "B - Industry",
                             :name "113130042"}
                            {:url
                             (format "%s/idh/105640815" akvo-flow-web-host),
                             :title "C - Retail",
                             :name "105640815"}
                            {:url
                             (format "%s/idh/111890828" akvo-flow-web-host),
                             :title "D - Civil Society (NGOs)",
                             :name "111890828"}
                            {:url
                             (format "%s/idh/134210832" akvo-flow-web-host),
                             :title "D - Standard setting organisations",
                             :name "134210832"}
                            {:url
                             (format "%s/idh/143215090" akvo-flow-web-host),
                             :title "Projects - Beyond Chocolate",
                             :name "143215090"}
                            {:url
                             (format "%s/idh/130990814" akvo-flow-web-host),
                             :title "B - Industry - Beyond Chocolate",
                             :name "130990814"}
                            {:url
                             (format "%s/idh/143340791" akvo-flow-web-host),
                             :title "C - Retail - Beyond Chocolate",
                             :name "143340791"}
                            {:url
                             (format "%s/idh/150700609" akvo-flow-web-host),
                             :title "D - Civil Society (NGOs) - Beyond Chocolate",
                             :name "150700609"}
                            {:url
                             (format "%s/idh/148430590" akvo-flow-web-host),
                             :title "D - Standard setting organisations - Beyond Chocolate",
                             :name "148430590"}]
           })


(defmethod ig/init-key :akvo.isco.config/config [_ _]
  data)
