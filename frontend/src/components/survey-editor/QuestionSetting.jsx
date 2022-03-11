import React from "react";
import { Row, Col, Form, Input, Checkbox, Button, Space } from "antd";
import { BiRadioCircle } from "react-icons/bi";

const QuestionSetting = () => {
  return (
    <>
      <div className="question-setting-wrapper">
        <Form.Item label={<BiRadioCircle />} name="option">
          <Input placeholder="Enter an answer choice" />
        </Form.Item>
        <Form.Item label={<BiRadioCircle />} name="option">
          <Input placeholder="Enter an answer choice" />
        </Form.Item>
      </div>
      <div className="question-setting-wrapper">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item name="repeat-object-key">
              <Input placeholder="Field" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="repeat-object-value">
              <Input placeholder="Value" />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div className="question-setting-wrapper">
        <Row>
          <Col span={1}>
            <Form.Item name="rule-other">
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={23}>
            <Input
              placeholder='Add an "Other" answer option or Comment Field'
              disabled
            />
          </Col>
        </Row>
        <Row>
          <Col span={1}>
            <Form.Item name="rule-none">
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={23}>
            <Input
              placeholder='Add a "None of the above" answer option'
              disabled
            />
          </Col>
        </Row>
      </div>
      <div className="question-button-wrapper">
        <Space align="center">
          <Button>Cancel</Button>
          <Button type="primary" ghost>
            Save
          </Button>
        </Space>
      </div>
    </>
  );
};

export default QuestionSetting;
