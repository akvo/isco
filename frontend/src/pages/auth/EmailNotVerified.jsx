import React from "react";
import "./style.scss";
import Auth from "./Auth";
import { Row, Alert, Button } from "antd";
import { api, store } from "../../lib";
import { useNotification } from "../../util";

const EmailNotVerified = () => {
  const { email } = store.useState((s) => s.user);
  const { notify } = useNotification();

  const handleResendVerificationEmail = () => {
    api
      .get(`/user/resend_verification_email?email=${email}`)
      .then(() => {
        notify({
          type: "success",
          message: "Email has ben sent, please check your email.",
        });
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Somehthing went wrong.",
        });
      });
  };

  return (
    <Auth>
      <Row>
        <Alert
          message="Email not verified"
          description={
            <>
              <p>
                Please verify your email by clicking link on email or resend the
                verification email.
              </p>
              <Button
                block
                danger
                type="ghost"
                onClick={handleResendVerificationEmail}
              >
                Resend verification email
              </Button>
            </>
          }
          type="error"
          showIcon
        />
      </Row>
    </Auth>
  );
};

export default EmailNotVerified;
