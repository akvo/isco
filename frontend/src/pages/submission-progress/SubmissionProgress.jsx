import React from "react";
import "./style.scss";
import { Row, Col, Typography } from "antd";

const { Title } = Typography;

const SubmissionProgress = () => {
  return (
    <div id="submission-progress">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Submission Progress
              </Title>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionProgress;
