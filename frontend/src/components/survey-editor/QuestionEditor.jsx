import React, { useState } from "react";
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
import {
  RiQuestionFill,
  RiSettings5Fill,
  RiDeleteBinFill,
} from "react-icons/ri";
import { MdFileCopy, MdGTranslate } from "react-icons/md";
import QuestionSetting from "./QuestionSetting";

const { Panel } = Collapse;

const PanelHeader = ({ activePanel, setActivePanel }) => {
  return (
    <Form.Item
      label={
        <Button
          type="text"
          size="small"
          onClick={() => setActivePanel(activePanel ? null : "q1")}
        >
          Q1
        </Button>
      }
      name="question-group-name"
    >
      <Input placeholder="Enter your question" />
    </Form.Item>
  );
};

const QuestionButtons = () => {
  return (
    <Space direction="vertical" size={1}>
      <Button type="text" icon={<RiSettings5Fill />} />
      <Button type="text" icon={<MdFileCopy />} />
      <Button type="text" icon={<MdGTranslate />} />
      <Button type="text" icon={<RiDeleteBinFill />} />
    </Space>
  );
};

const Question = ({ form }) => {
  const [activePanel, setActivePanel] = useState(null);
  console.log(activePanel);

  return (
    <Row className="question-editor-wrapper">
      <Col span={24}>
        <Card className="question-card-wrapper">
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={18} align="start" className="left">
              <Collapse ghost activeKey={activePanel}>
                <Panel
                  key="q1"
                  showArrow={false}
                  header={
                    <PanelHeader
                      activePanel={activePanel}
                      setActivePanel={setActivePanel}
                    />
                  }
                >
                  <Row className="panel-body-wrapper">
                    <Col className="button-wrapper" style={{ width: "40px" }}>
                      <QuestionButtons />
                    </Col>
                    <Col className="input-wrapper">
                      <QuestionSetting />
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
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
