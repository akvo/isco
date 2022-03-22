import React, { useState } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button } from "antd";
import Auth from "./Auth";
import { api } from "../../lib";
import { useCookies } from "react-cookie";
import { useNotification } from "../../util";

const Login = () => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [cookies, setCookie] = useCookies(["AUTH_TOKEN"]);
  const { notify } = useNotification();

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

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12} align="start">
            <p>Login</p>
          </Col>
          <Col span={12} align="end">
            <p className="float-right">
              Don&apos;t have any account? <Link to="/register">Register</Link>
            </p>
          </Col>
        </Row>
        <Form
          form={form}
          className="form-wrapper"
          onFinish={handleLoginOnFinish}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email address." },
            ]}
          >
            <Input
              className="bg-grey"
              placeholder="Email address"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password." }]}
          >
            <Input.Password
              className="bg-grey"
              placeholder="Password"
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
            Login
          </Button>
        </Form>
        <a href="#">Forgot password?</a>
      </Space>
    </Auth>
  );
};

export default Login;
