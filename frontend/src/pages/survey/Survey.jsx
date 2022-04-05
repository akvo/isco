import React from "react";
import "./style.scss";
import { Row, Col, Select, Button, Space } from "antd";
import WebformPage from "./WebformPage";

const Survey = () => {
  return (
    <div id="survey" className="container">
      <Row>
        <p>
          Data security provisions for the data that will be submitted as part
          of this survey.
        </p>
      </Row>
      <Row
        className="form-selector-container"
        align="middle"
        justify="space-between"
        gutter={[12, 12]}
      >
        <Col span={16} className="saved-form-wrapper">
          <p>Pick a previously saved form</p>
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={16}>
              <Select
                className="bg-grey"
                placeholder="Select..."
                options={[]}
              />
            </Col>
            <Col span={8}>
              <Space>
                <Button>Refresh</Button>
                <Button>Open</Button>
                <Button>Collaborators</Button>
              </Space>
            </Col>
          </Row>
        </Col>
        <Col span={8} className="new-form-wrapper">
          <p>Start filling a new form</p>
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={18}>
              <Select
                className="bg-grey"
                placeholder="Select..."
                options={[]}
              />
            </Col>
            <Col span={6}>
              <Button block>Open</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <br />
      <hr />
      {/* Webform load here */}
      <WebformPage formId={1} />
    </div>
  );
};

export default Survey;
