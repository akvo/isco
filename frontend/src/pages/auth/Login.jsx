import React, { useState, useMemo } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button } from "antd";
import Auth from "./Auth";
import { api, store } from "../../lib";
import { useCookies } from "react-cookie";
import { useNotification } from "../../util";
import { uiText } from "../../static";

const Login = () => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [cookies, setCookie] = useCookies(["AUTH_TOKEN"]);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const handleLoginOnFinish = (values) => {
    setBtnLoading(true);
    const { email, password } = values;
    const params = `email=${email}&password=${password}`;
    api
      .post(`/user/login?${params}`)
      .then((res) => {
        const { data } = res;
        setCookie("AUTH_TOKEN", data?.access_token, { path: "/" });
        api.setToken(cookies?.AUTH_TOKEN);
        store.update((s) => {
          s.isLoggedIn = true;
        });
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Email password doesn't match.",
        });
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12} align="start">
            <h2>{text.formLogin}</h2>
          </Col>
          {/* <Col span={12} align="end">
            <p className="float-right">
              Don&apos;t have any account? <Link to="/register">Register</Link>
            </p>
          </Col> */}
        </Row>
        <Form
          form={form}
          className="form-wrapper"
          onFinish={handleLoginOnFinish}
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
          <Button
            type="primary"
            ghost
            block
            size="large"
            onClick={() => form.submit()}
            loading={btnLoading}
          >
            {text.btnLogin}
          </Button>
        </Form>
        <a href="#">{text.formForgotPwd}</a>
      </Space>
    </Auth>
  );
};

export default Login;
