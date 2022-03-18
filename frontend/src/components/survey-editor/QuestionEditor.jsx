import React, { useState, useEffect } from "react";
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
import { MdGTranslate } from "react-icons/md";
import QuestionSetting from "./QuestionSetting";
import { store, api } from "../../lib";
import { isoLangs } from "../../lib";

const { Panel } = Collapse;

const QuestionNameInput = ({ question }) => {
  return (
    <Form.Item
      name={`question-${question?.id}-name`}
      rules={[{ required: true, message: "Please input your question" }]}
    >
      <Input placeholder="Enter your question" />
    </Form.Item>
  );
};

const TranslationTab = ({ activeLang, setActiveLang }) => {
  const state = store.useState((s) => s?.surveyEditor);
  const { languages } = state;

  return (
    <div className="translation-tab-wrapper">
      <Space>
        {languages?.map((l, li) => (
          <Button
            key={`question-${l}-${li}`}
            type="text"
            className={`${activeLang === l ? "active" : ""}`}
            onClick={() => setActiveLang(l)}
          >
            {isoLangs?.[l]?.name}
          </Button>
        ))}
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
      {/* <Button type="text" icon={<MdFileCopy />} /> */}
      <Button
        className={`${activeSetting === "translation" ? "active" : ""}`}
        type="text"
        icon={<MdGTranslate />}
        onClick={() => setActiveSetting("translation")}
      />
      {/* <Button type="text" icon={<RiDeleteBinFill />} /> */}
    </Space>
  );
};

const QuestionEditor = ({
  form,
  index,
  question,
  questionGroup,
  handleFormOnValuesChange,
  submitStatus,
  setSubmitStatus,
}) => {
  const state = store.useState((s) => s?.surveyEditor);
  const optionValues = store.useState((s) => s?.optionValues);
  const { question_type } = optionValues;
  const qId = question?.id;
  const panelKey = `qe-${qId}`;

  const [activePanel, setActivePanel] = useState(null);
  const [activeSetting, setActiveSetting] = useState("detail");
  const [allowOther, setAllowOther] = useState(false);
  const [allowDecimal, setAllowDecimal] = useState(false);
  const [mandatory, setMandatory] = useState(false);
  const [personalData, setPersonalData] = useState(false);
  const [activeLang, setActiveLang] = useState(state?.languages[0]);

  useEffect(() => {
    if (qId) {
      // Load question value to fields
      Object.keys(question).forEach((key) => {
        const field = `question-${qId}-${key}`;
        const value = question?.[key];
        form.setFieldsValue({ [field]: value });
        // Load allow other value
        if (key === "rule" && value) {
          Object.keys(value).forEach((key) => {
            form.setFieldsValue({ [`${field}-${key}`]: value?.[key] });
            if (key === "allow_other") {
              setAllowOther(value?.[key]);
            }
            if (key === "allow_decimal") {
              setAllowDecimal(value?.[key]);
            }
          });
        }
        // Load repeating objects value
        if (key === "repeating_objects" && value) {
          value?.forEach((val, vi) => {
            Object.keys(val).forEach((key) => {
              const rField = `${field}_${key}-${vi}`;
              form.setFieldsValue({ [rField]: val?.[key] });
            });
          });
        }
        // Load option value
        if (key === "option" && value) {
          value?.forEach((val) => {
            const opId = val?.id;
            const opField = `${field}-${opId}`;
            form.setFieldsValue({ [opField]: val?.name });
            // Load option translations
            if (val?.translations?.length > 0) {
              const opTransFieldPrefix = `question-${qId}-translations`;
              val?.translations?.forEach((val) => {
                const lang = val?.language;
                Object.keys(val).forEach((key) => {
                  const optTransField = `${opTransFieldPrefix}-${lang}-option_${key}-${opId}`;
                  form.setFieldsValue({ [optTransField]: val?.[key] });
                });
              });
            }
          });
        }
        if (key === "mandatory") {
          setMandatory(value);
        }
        if (key === "personal_data") {
          setPersonalData(value);
        }
        // Load skip logic
        if (key === "skip_logic") {
          value?.forEach((val) => {
            Object.keys(val).forEach((key) => {
              const skipField = `${field}-${key}`;
              let skipValue = String(val?.[key]);
              if (key === "value") {
                skipValue = skipValue?.split("|");
                skipValue = Array.isArray(skipValue) ? skipValue : [skipValue];
              }
              form.setFieldsValue({ [skipField]: skipValue });
            });
          });
        }
        // Load question translations
        if (key === "translations") {
          value?.forEach((val) => {
            const lang = val?.language;
            Object.keys(val).forEach((key) => {
              const transField = `${field}-${lang}-${key}`;
              form.setFieldsValue({ [transField]: val?.[key] });
            });
          });
        }
      });
    }
  }, [question, form, qId]);

  const handleDeleteQuestionButton = (question) => {
    const { id } = question;
    api
      .delete(`/question/${id}`)
      .then(() => {
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
            questionGroup: [...filterQuestionGroup, deletedQuestionOnQg],
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  return (
    <Row key={`qe-${qId}`} className="question-editor-wrapper">
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
                          setActivePanel(panelKey);
                          setActiveSetting("detail");
                        }}
                      >
                        {`Q${index}`}
                      </Button>
                      {(activeSetting === "detail" ||
                        activeSetting === "setting") && (
                        <QuestionNameInput index={index} question={question} />
                      )}
                      {activeSetting === "translation" && (
                        <TranslationTab
                          activeLang={activeLang}
                          setActiveLang={setActiveLang}
                        />
                      )}
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
                        form={form}
                        activeSetting={activeSetting}
                        questionGroup={questionGroup}
                        question={question}
                        handleFormOnValuesChange={handleFormOnValuesChange}
                        submitStatus={submitStatus}
                        setSubmitStatus={setSubmitStatus}
                        allowOther={allowOther}
                        setAllowOther={setAllowOther}
                        allowDecimal={allowDecimal}
                        setAllowDecimal={setAllowDecimal}
                        mandatory={mandatory}
                        setMandatory={setMandatory}
                        personalData={personalData}
                        setPersonalData={setPersonalData}
                        setActivePanel={setActivePanel}
                        activeLang={activeLang}
                        setActiveLang={setActiveLang}
                      />
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col>

            <Col span={6} align="end" className="right">
              <Space align="start">
                <Form.Item
                  name={`question-${qId}-type`}
                  rules={[
                    { required: true, message: "Please select question type" },
                  ]}
                >
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
                    onChange={() => setActivePanel(panelKey)}
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
