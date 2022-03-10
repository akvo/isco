import React from "react";
import "./style.scss";
import { Row, Col, Button, Space } from "antd";

const Home = () => {
  return (
    <div id="home">
      <Row className="home-landing" align="middle" justify="center">
        <Col className="intro-text" align="middle">
          <h1>WELCOME TO THE COCOA MONITORING!</h1>
          <Space direction="vertical">
            <p>
              Dear Participants, <br />
              Thank you for participating in this pilot of our new monitoring
              system. Your comments on the monitoring system are very valuable
              for us – you can give them in the feedback section (menu above) or
              in the comment fields in the questionnaires. Before you start,
              please use this link to check on the data security and
              confidentiality measures taken.
            </p>
            <p>
              Thank you very much for your contribution to making the cocoa
              sector more sustainable!
            </p>
          </Space>
          <div className="start-btn-wrapper">
            <Button type="primary" size="large" to="#">
              Click here to start the survey
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="getting-started" align="middle" justify="center">
        <Col align="middle">
          <h1>Getting Started</h1>
          <p>
            For in-depth info, please watch the video at this link (or watch it
            directly below).
          </p>
          <p>
            You should also visit our FAQ section which contain answers to most
            questions.
          </p>
          <p>We also prepare a slide, describing the tool functionalities.</p>
          <p>
            If you need any more info, don't hesitate to get in touch directly:
            feedback form
          </p>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
