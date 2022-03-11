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
import { RiQuestionFill, RiSettings5Fill } from "react-icons/ri";
import { BiRadioCircle } from "react-icons/bi";

const { Panel } = Collapse;

const Question = ({ form }) => {
  const [activePanel, setActivePanel] = useState(null);
  console.log(activePanel);

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
              <Collapse ghost activeKey={activePanel}>
                <Panel
                  key="q1"
                  showArrow={false}
                  header={
                    <Form.Item
                      label={
                        <Button
                          type="text"
                          size="small"
                          onClick={() =>
                            setActivePanel(activePanel ? null : "q1")
                          }
                        >
                          Q1
                        </Button>
                      }
                      name="question-group-name"
                    >
                      <Input placeholder="Enter your question" />
                    </Form.Item>
                  }
                >
                  <Row className="panel-body-wrapper">
                    <Col className="button-wrapper" span={1}>
                      <Button type="text" icon={<RiSettings5Fill />} />
                    </Col>
                    <Col className="input-wrapper" span={23}>
                      <Form.Item label={<BiRadioCircle />} name="option">
                        <Input placeholder="Enter an answer choice" />
                      </Form.Item>
                      <Form.Item label={<BiRadioCircle />} name="option">
                        <Input placeholder="Enter an answer choice" />
                      </Form.Item>
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
