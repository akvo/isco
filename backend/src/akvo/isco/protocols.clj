(ns akvo.isco.protocols)

(defprotocol SendEmail
  (send-email [this recipients email] "Send email"))
