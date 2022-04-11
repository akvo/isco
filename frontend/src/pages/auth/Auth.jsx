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
            <Row align="middle">
              <Col>
                <Image
                  width={193}
                  height={60}
                  src="/images/beyond.jpg"
                  preview={false}
                />
              </Col>
              <Col>
                <Image
                  width={233}
                  height={60}
                  src="/images/gisco.jpg"
                  preview={false}
                />
              </Col>
              <Col>
                <Image
                  width={175}
                  height={70}
                  src="/images/disco.png"
                  preview={false}
                />
              </Col>
            </Row>
          </Space>
        </Col>
        <Col span={10}>{children}</Col>
      </Row>
    </div>
  );
};

export default Auth;
