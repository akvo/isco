import React from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button, Select } from "antd";
import Auth from "./Auth";

const Register = () => {
  const [form] = Form.useForm();

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12} align="start">
            <p>Register</p>
          </Col>
          <Col span={12} align="end">
            <p className="float-right">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </Col>
        </Row>
        <Form form={form} className="form-wrapper">
          <Form.Item
            name="fullname"
            rules={[
              { required: true, message: "Please input your full name." },
            ]}
          >
            <Input className="bg-grey" placeholder="Full Name" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email address." },
            ]}
          >
            <Input
              className="bg-grey"
              placeholder="Email Address"
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
          <Form.Item
            name="confirm-password"
            rules={[
              {
                required: true,
                message: "Please input confirm your password.",
              },
            ]}
          >
            <Input.Password
              className="bg-grey"
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Select
              size="large"
              className="bg-grey"
              placeholder="Filter organizations by"
              options={[]}
            />
          </Form.Item>
          <Form.Item
            name="organisation"
            rules={[
              {
                required: true,
                message: "Please select your Organization.",
              },
            ]}
          >
            <Select
              className="bg-grey"
              size="large"
              placeholder="Organization"
              options={[]}
            />
          </Form.Item>
          <Button
            type="primary"
            ghost
            block
            onClick={() => form.submit()}
            size="large"
          >
            Register
          </Button>
        </Form>
      </Space>
    </Auth>
  );
};

export default Register;
