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
import { RiSettings5Fill, RiDeleteBinFill } from "react-icons/ri";
import { MdFileCopy, MdGTranslate } from "react-icons/md";
import QuestionSetting from "./QuestionSetting";
import { store } from "../../lib";
import orderBy from "lodash/orderBy";

const { Panel } = Collapse;

const QuestionNameInput = ({ index, question }) => {
  return (
    <Form.Item name={`question-name-${question?.id}`}>
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

const QuestionMenu = ({ activeSetting, setActiveSetting }) => {
  return (
    <Space direction="vertical" size={1} className="question-menu-wrapper">
      <Button
        className={`${activeSetting === "setting" ? "active" : ""}`}
        type="text"
        icon={<RiSettings5Fill />}
        onClick={() => setActiveSetting("setting")}
      />
      <Button type="text" icon={<MdFileCopy />} />
      <Button
        className={`${activeSetting === "translation" ? "active" : ""}`}
        type="text"
        icon={<MdGTranslate />}
        onClick={() => setActiveSetting("translation")}
      />
      <Button type="text" icon={<RiDeleteBinFill />} />
    </Space>
  );
};

const QuestionEditor = ({ form, index, question, questionGroup }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [activeSetting, setActiveSetting] = useState("detail");
  const state = store.useState((s) => s?.surveyEditor);
  const optionValues = store.useState((s) => s?.optionValues);
  const { question_type } = optionValues;
  const panelKey = `qe-${index}`;

  const handleDeleteQuestionButton = (question) => {
    const filterQuestionGroup = state?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );
    let deletedQuestionOnQg = questionGroup;
    const filterQuestion = deletedQuestionOnQg?.question?.filter(
      (q) => q?.id !== question?.id
    );
    deletedQuestionOnQg = {
      ...deletedQuestionOnQg,
      question: filterQuestion,
    };
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy(
          [...filterQuestionGroup, deletedQuestionOnQg],
          ["order"]
        ),
      };
    });
  };

  return (
    <Row key={`qe-${index}`} className="question-editor-wrapper">
      <Col span={24}>
        <Card className="question-card-wrapper">
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={18} align="start" className="left">
              <Collapse ghost activeKey={activePanel}>
                <Panel
                  key={panelKey}
                  showArrow={false}
                  header={
                    <>
                      <Button
                        className="question-number"
                        type="text"
                        size="small"
                        onClick={() => {
                          setActivePanel(activePanel ? null : panelKey);
                          setActiveSetting("detail");
                        }}
                      >
                        {`Q${index}`}
                      </Button>
                      {(activeSetting === "detail" ||
                        activeSetting === "setting") && (
                        <QuestionNameInput index={index} question={question} />
                      )}
                      {activeSetting === "translation" && <TranslationTab />}
                    </>
                  }
                >
                  <Row className="panel-body-wrapper">
                    <Col className="button-wrapper" style={{ width: "40px" }}>
                      <QuestionMenu
                        activeSetting={activeSetting}
                        setActiveSetting={setActiveSetting}
                      />
                    </Col>
                    <Col className="input-wrapper">
                      <QuestionSetting
                        activeSetting={activeSetting}
                        questionGroup={questionGroup}
                        question={question}
                      />
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col>

            <Col span={6} align="end" className="right">
              <Space align="start">
                <Form.Item name={`question-type-${index}`}>
                  <Select
                    showSearch={true}
                    className="custom-dropdown-wrapper"
                    placeholder="Question Type"
                    options={question_type?.map((item) => ({
                      label: item.split("_").join(" "),
                      value: item,
                    }))}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<RiDeleteBinFill />}
                  onClick={() => handleDeleteQuestionButton(question)}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionEditor;
