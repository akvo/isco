import React from "react";
import "./style.scss";
import { Row, Col, Space, Typography, Image } from "antd";

const { Title } = Typography;

const Auth = ({ children }) => {
  return (
    <div id="auth">
      <Row className="auth-landing"></Row>
      <Row
        className="auth-form-container"
        align="middle"
        justify="space-between"
      >
        <Col span={12}>
          <Space direction="vertical" size={20}>
            <Title className="title" level={2}>
              Monitoring for 2021 data
            </Title>
            <Space>
              <Image width={180} src="/images/beyond.jpg" preview={false} />
              <Image width={280} src="/images/gisco.jpg" preview={false} />
            </Space>
          </Space>
        </Col>
        <Col span={12}>{children}</Col>
      </Row>
    </div>
  );
};

export default Auth;
