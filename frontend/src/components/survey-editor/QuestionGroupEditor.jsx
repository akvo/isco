import React from "react";
import { Row, Col, Card, Form, Input, Button, Space } from "antd";
import { RiSettings5Fill, RiDeleteBinFill } from "react-icons/ri";
import Question from "./QuestionEditor";

const QuestionGroupEditor = ({ form }) => {
  return (
    <Row className="question-group-editor-wrapper">
      <Col span={24}>
        <Card className="qge-card-wrapper">
          <Row
            className="section-title-row"
            align="middle"
            justify="space-between"
          >
            <Col span={18} align="start" className="left">
              <Form.Item name="question-group-name">
                <Input placeholder="Section Title" />
              </Form.Item>
            </Col>
            <Col span={6} align="end" className="right">
              <Space size={1} align="center">
                <Button type="text" icon={<RiSettings5Fill />} />
                <Button type="text" icon={<RiDeleteBinFill />} />
              </Space>
            </Col>
          </Row>
          <Question form={form} />
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionGroupEditor;
