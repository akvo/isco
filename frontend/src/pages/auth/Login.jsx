import React, { useState, useMemo, useEffect } from "react";
import "./style.scss";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button, Alert } from "antd";
import Auth from "./Auth";
import { api, store } from "../../lib";
import { useCookies } from "react-cookie";
import { useNotification } from "../../util";
import { uiText } from "../../static";

const VerifyEmailMessage = ({ email, verifyStatus }) => {
  return (
    <>
      {email && verifyStatus === 200 && (
        <Row>
          <Alert
            showIcon
            type="success"
            message="Your email has been verified, please login to continue."
          />
        </Row>
      )}
      {email && verifyStatus === 401 && (
        <Row>
          <Alert
            showIcon
            type="error"
            message="Your link was expired. Please login to resend verification email."
          />
        </Row>
      )}
      {email && verifyStatus && ![200, 401].includes(verifyStatus) && (
        <Row>
          <Alert
            showIcon
            type="error"
            message="Something went wrong. Please contact admin for more information."
          />
        </Row>
      )}
    </>
  );
};

const Login = () => {
  const { client_id, client_secret } = window.__ENV__;
  const { email } = useParams();
  const [verifyStatus, setVerifyStatus] = useState(null);

  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  useEffect(() => {
    if (email) {
      api
        .put(`/user/verify_email?email=${email}`)
        .then((res) => {
          setVerifyStatus(res.status);
        })
        .catch((e) => {
          const { status } = e.response;
          setVerifyStatus(status);
        });
    }
  }, [email]);

  const handleLoginOnFinish = (values) => {
    setBtnLoading(true);
    const { email, password } = values;

    const payload = new FormData();
    payload.append("grant_type", "password");
    payload.append("username", email);
    payload.append("password", password);
    payload.append("scope", "openid email");
    payload.append("client_id", client_id);
    payload.append("client_secret", client_secret);

    api
      .post(`/user/login`, payload)
      .then((res) => {
        const { data } = res;
        removeCookie("AUTH_TOKEN");
        removeCookie("REFRESH_TOKEN");
        const options = data?.expired
          ? { expires: new Date(data.expired) }
          : {};
        setCookie("AUTH_TOKEN", data?.access_token, options);
        setCookie("REFRESH_TOKEN", data?.refresh_token);
        api.setToken(cookies?.AUTH_TOKEN);
        store.update((s) => {
          s.isLoggedIn = true;
          s.user = data.user;
        });
        navigate("/home");
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Email password doesn't match.",
        });
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  const handleForgotPassword = (values) => {
    setBtnLoading(true);
    const { email } = values;
    const payload = new FormData();
    payload.append("email", email);
    api
      .post(`/user/forgot-password`, payload)
      .then(() => {
        notify({
          type: "success",
          message: "Reset Password link has been sent to your email",
        });
        setResetPasswordSuccess(true);
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Email not found",
        });
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  if (resetPasswordSuccess) {
    return (
      <Auth>
        <Space direction="vertical">
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={12} align="start">
              <h2>{text.formForgotPwd}</h2>
            </Col>
          </Row>
          <Button
            type="text"
            onClick={(e) => {
              e.preventDefault();
              setResetPasswordSuccess(false);
              setResetPassword(false);
            }}
          >
            {text.btnBackToLogin}
          </Button>
        </Space>
      </Auth>
    );
  }

  return (
    <Auth>
      <Space direction="vertical">
        <VerifyEmailMessage email={email} verifyStatus={verifyStatus} />
        <Row align="bottom" justify="space-between" gutter={[12, 12]}>
          <Col span={8} align="start">
            <h2>{resetPassword ? text.formForgotPwd : text.formLogin}</h2>
          </Col>
          <Col span={16} align="end">
            <p className="float-right">
              {text.formDontHaveAccount}{" "}
              <Link to="/register">{text.formRegister}</Link>
            </p>
          </Col>
        </Row>
        <p className="data-security-provisions-doc-info">
          {text.infoDataSecurityDoc}
        </p>
        <Form
          form={form}
          className="form-wrapper"
          onFinish={!resetPassword ? handleLoginOnFinish : handleForgotPassword}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: text.valEmail }]}
          >
            <Input
              className="bg-grey"
              placeholder={text.formEmail}
              size="large"
            />
          </Form.Item>
          {!resetPassword && (
            <Form.Item
              name="password"
              rules={[{ required: true, message: text.valPwd }]}
            >
              <Input.Password
                className="bg-grey"
                placeholder={text.formPwd}
                size="large"
              />
            </Form.Item>
          )}
          <Button
            type="primary"
            ghost
            block
            size="large"
            onClick={() => form.submit()}
            loading={btnLoading}
          >
            {!resetPassword ? text.btnLogin : text.formResetPwd}
          </Button>
        </Form>
        <div style={{ textAlign: "right" }}>
          <Button
            type="link"
            onClick={(e) => {
              e.preventDefault();
              setResetPassword(!resetPassword);
            }}
          >
            {resetPassword ? text.btnBackToLogin : text.formForgotPwd}
          </Button>
        </div>
      </Space>
    </Auth>
  );
};

export default Login;
