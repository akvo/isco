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
        gutter={[64, 24]}
      >
        <Col span={14}>
          <Space direction="vertical">
            <Title className="title" level={2}>
              Monitoring for 2021 data
            </Title>
            <Space size={35}>
              <Image height={65} src="/images/beyond.jpg" preview={false} />
              <Image height={65} src="/images/gisco.jpg" preview={false} />
              <Image height={65} src="/images/disco.png" preview={false} />
            </Space>
          </Space>
        </Col>
        <Col span={10}>{children}</Col>
      </Row>
    </div>
  );
};

export default Auth;
