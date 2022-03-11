import React from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Space,
  Select,
  Collapse,
} from "antd";
import { RiQuestionFill } from "react-icons/ri";

const { Panel } = Collapse;

const Question = ({ form }) => {
  return (
    <Row className="question-editor-wrapper">
      <Col span={24}>
        <Card className="q-card-wrapper">
          <Row
            className="question-row"
            align="middle"
            justify="space-between"
            gutter={[12, 12]}
          >
            <Col span={18} align="start" className="left">
              <Form.Item label="Q1" name="question-group-name">
                <Input placeholder="Section Title" />
              </Form.Item>
            </Col>
            <Col span={6} align="end" className="right">
              <Space align="center">
                <Select
                  className="custom-dropdown-wrapper"
                  placeholder="Question Type"
                  options={[]}
                />
                <Button type="text" icon={<RiQuestionFill />} />
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Question;
