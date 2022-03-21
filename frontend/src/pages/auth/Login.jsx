import React from "react";
import "./style.scss";
import { Row, Col, Space, Typography, Image, Form, Input, Button } from "antd";

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  console.info(form);

  return (
    <div id="auth">
      <Row className="auth-landing"></Row>
      <Row
        className="auth-form-container"
        align="middle"
        justify="space-between"
        gutter={[24, 24]}
      >
        <Col span={12}>
          <Space direction="vertical">
            <Title className="title" level={2}>
              Monitoring for 2022 data
            </Title>
            <Space size={50}>
              <Image height={65} src="/images/beyond.jpg" preview={false} />
              <Image height={65} src="/images/gisco.jpg" preview={false} />
            </Space>
          </Space>
        </Col>
        <Col span={12}>
          <Row
            className="form-title"
            align="middle"
            justify="space-between"
            gutter={[12, 12]}
          >
            <Col span={12} align="start">
              Login
            </Col>
            <Col span={12} align="end">
              <div className="float-right">
                Don&apos;t have any account? Register
              </div>
            </Col>
          </Row>
          <Form className="form">
            <Form.Item>
              <Input className="bg-grey" placeholder="Email address" />
            </Form.Item>
            <Form.Item>
              <Input.Password className="bg-grey" placeholder="Password" />
            </Form.Item>
            <Button type="primary" ghost block>
              Login
            </Button>
          </Form>
          <p>Forgot password?</p>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
