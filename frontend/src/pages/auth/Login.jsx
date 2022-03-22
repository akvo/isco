import React from "react";
import "./style.scss";
import { Row, Col, Space, Form, Input, Button } from "antd";
import Auth from "./Auth";

const Login = () => {
  const [form] = Form.useForm();
  console.info(form);

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12} align="start">
            <p>Login</p>
          </Col>
          <Col span={12} align="end">
            <p className="float-right">
              Don&apos;t have any account? <a href="#">Register</a>
            </p>
          </Col>
        </Row>
        <Form form={form} className="form-wrapper">
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
