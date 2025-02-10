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
        <Col span={10} className="children-wrapper">
          {children}
        </Col>
      </Row>
      <Row
        style={{
          marginTop: "6rem",
          width: "100%",
          background: "#fff",
          boxShadow: "1px -2px 7px 0px rgba(207, 207, 207, 0.75)",
          WebkitBoxShadow: "1px -2px 7px 0px rgba(207, 207, 207, 0.75)",
          MozBoxShadow: "1px -2px 7px 0px rgba(207, 207, 207, 0.75)",
          padding: "16px 32px",
          fontSize: 14,
          fontStyle: "italic",
        }}
      >
        <Col span={24}>
          For the best experience, we recommend using Google Chrome (Version 110
          and above), Mozilla Firefox (Version 110 and above), Microsoft Edge
          (Version 110 and above), or Safari (Version 16.4 and above). Our tool
          is optimized for these browsers to ensure smooth performance and full
          feature compatibility. To know your browser version{" "}
          <a
            href="https://www.whatsmybrowser.org"
            target="_blank"
            rel="noreferrer"
          >
            click here
          </a>
          .
        </Col>
      </Row>
    </div>
  );
};

export default Auth;
