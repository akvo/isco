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

const QuestionNameInput = () => {
  return (
    <Form.Item name="question-group-name">
      <Input placeholder="Enter your question" />
    </Form.Item>
  );
};

const TranslationTab = () => {
  return (
    <div className="translation-tab-wrapper">
      <Space>
        <Button type="text" className="active">
          French
        </Button>
        <Button type="text">German</Button>
      </Space>
    </div>
  );
};

const QuestionMenu = ({ setIsLangActive }) => {
  return (
    <Space direction="vertical" size={1}>
      <Button
        type="text"
        icon={<RiSettings5Fill />}
        onClick={() => setIsLangActive(false)}
      />
      <Button type="text" icon={<MdFileCopy />} />
      <Button
        type="text"
        icon={<MdGTranslate />}
        onClick={() => setIsLangActive(true)}
      />
      <Button type="text" icon={<RiDeleteBinFill />} />
    </Space>
  );
};

const Question = ({ form }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [isLangActive, setIsLangActive] = useState(false);

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
                    <>
                      <Button
                        className="question-number"
                        type="text"
                        size="small"
                        onClick={() =>
                          setActivePanel(activePanel ? null : "q1")
                        }
                      >
                        Q1
                      </Button>
                      {isLangActive ? (
                        <TranslationTab />
                      ) : (
                        <QuestionNameInput />
                      )}
                    </>
                  }
                >
                  <Row className="panel-body-wrapper">
                    <Col className="button-wrapper" style={{ width: "40px" }}>
                      <QuestionMenu setIsLangActive={setIsLangActive} />
                    </Col>
                    <Col className="input-wrapper">
                      <QuestionSetting isLangActive={isLangActive} />
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
