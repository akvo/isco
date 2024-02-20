import React, { useMemo } from "react";
import "./style.scss";
import { Row, Col, Space, Typography, Image } from "antd";
import { uiText } from "../../static";
import { store } from "../../lib";

const { Title } = Typography;

const Auth = ({ children }) => {
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <div id="auth">
      <Row className="auth-landing"></Row>
      <Row className="auth-form-container" align="top" justify="space-between">
        <Col span={12} className="brand-wrapper">
          <Space direction="vertical" size={20}>
            <Title className="title" level={2}>
              {text.welcome2}
            </Title>
            <Row align="middle" justify="space-between" gutter={[20, 20]} wrap>
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
              <Col>
                <Image
                  width={184}
                  height={50}
                  src="/images/swissco.svg"
                  preview={false}
                />
              </Col>
              <Col>
                <Image
                  width={175}
                  // height={70}
                  src="/images/frisco.png"
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
