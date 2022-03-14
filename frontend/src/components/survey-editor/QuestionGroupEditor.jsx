import React from "react";
import { Row, Col, Card, Form, Input, Button, Space } from "antd";
import { RiSettings5Fill, RiDeleteBinFill } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";
import { MdTextFields } from "react-icons/md";
import { AiOutlineGroup } from "react-icons/ai";
import Question from "./QuestionEditor";

const QuestionGroupEditor = ({ form }) => {
  return (
    <Row
      className="question-group-editor-wrapper"
      align="bottom"
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={21}>
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
      <Col span={3} align="center">
        <Card className="button-control-wrapper">
          <Space align="center">
            <Button ghost icon={<HiPlus />} />
            <Button ghost icon={<MdTextFields />} />
            <Button ghost icon={<AiOutlineGroup />} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionGroupEditor;
