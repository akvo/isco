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
  Popconfirm,
  Tooltip,
  Tag,
} from "antd";
import {
  RiSettings5Fill,
  RiDeleteBinFill,
  RiDragMove2Fill,
  RiEditFill,
  RiTranslate2,
} from "react-icons/ri";
import { TbTrashOff } from "react-icons/tb";
import QuestionTabContent from "./QuestionTabContent";
import { store, api } from "../../lib";
import { isoLangs } from "../../lib";
import { useNotification } from "../../util";
import capitalize from "lodash/capitalize";

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
  const { surveyEditor } = store.useState((s) => s);
  const { languages } = surveyEditor;

  return (
    <Space direction="vertical" size={1} className="question-menu-wrapper">
      <Tooltip title="Show question setting">
        <Button
          className={`${activeSetting === "setting" ? "active" : ""}`}
          type="text"
          icon={<RiSettings5Fill />}
          onClick={() => setActiveSetting("setting")}
        />
      </Tooltip>
      {/* <Button type="text" icon={<MdFileCopy />} /> */}
      <Tooltip title="Show question translation setting">
        <Button
          className={`${activeSetting === "translation" ? "active" : ""}`}
          type="text"
          icon={<RiTranslate2 />}
          onClick={() => setActiveSetting("translation")}
          disabled={!languages?.length || !languages}
        />
      </Tooltip>
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
  questionToDeactivate,
  setQuestionToDeactivate,
  toggleMove = false,
}) => {
  const { surveyEditor, optionValues } = store.useState((s) => s);
  const { languages, questionGroup: questionGroupState } = surveyEditor;

  const { question_type } = optionValues;
  const qId = question?.id;
  const panelKey = `qe-${qId}`;
  const { notify } = useNotification();

  const [activePanel, setActivePanel] = useState(null);
  const [activeSetting, setActiveSetting] = useState("detail");
  const [allowOther, setAllowOther] = useState(false);
  const [allowDecimal, setAllowDecimal] = useState(false);
  const [mandatory, setMandatory] = useState(false);
  const [coreMandatory, setCoreMandatory] = useState(false);
  const [personalData, setPersonalData] = useState(false);
  const [datapointName, setDatapointName] = useState(false);
  const [activeLang, setActiveLang] = useState(null);
  const [allowNA, setAllowNA] = useState(false);
  const [isRepeatIdentifierValue, setIsRepeatIdentifierValue] = useState(false);
  const [showAsTextarea, setShowAsTextarea] = useState(false);

  // handle when form languages updated
  useEffect(() => {
    if (languages?.length) {
      setActiveLang(languages?.[0]);
    } else {
      setActiveLang(null);
      if (activeSetting === "translation") {
        setActiveSetting("detail");
      }
    }
  }, [languages, activeSetting]);

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
            if (key === "allowNA") {
              setAllowNA(value?.[key]);
            }
          });
        }
        // Load autofield value
        if (key === "autofield" && value) {
          Object.keys(value).forEach((key) => {
            if (key === "fnString") {
              form.setFieldsValue({ [`${field}-${key}`]: value?.[key] });
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
        if (key === "core_mandatory") {
          setCoreMandatory(value);
        }
        if (key === "personal_data") {
          setPersonalData(value);
        }
        if (key === "datapoint_name") {
          setDatapointName(value);
        }
        // Load skip logic
        if (key === "skip_logic") {
          value?.forEach((val) => {
            Object.keys(val).forEach((key) => {
              let skipField = `${field}-${key}`;
              let skipValue = val?.[key];
              if (val?.type?.includes("option") && key === "value") {
                if (String(skipValue)?.includes("|")) {
                  //transform value from db
                  skipValue = skipValue?.split("|")?.map((x) => Number(x));
                }
                skipValue = Array.isArray(skipValue)
                  ? skipValue
                  : [Number(skipValue)];
                skipField = `${skipField}-option`;
              }
              if (!val?.type?.includes("option") && key === "value") {
                skipField = `${skipField}-number`;
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
        // Load tooltip translations
        if (key === "tooltip_translations") {
          const tooltipTransField = `question-${qId}-translations`;
          value?.forEach((val) => {
            const lang = val?.language;
            Object.keys(val).forEach((key) => {
              const transField = `${tooltipTransField}-${lang}-${key}`;
              form.setFieldsValue({ [transField]: val?.[key] });
            });
          });
        }
        // Handle leading_question -> is_repeat_identifier
        if (key === "is_repeat_identifier") {
          setIsRepeatIdentifierValue(value);
        }
        if (key === "show_as_textarea") {
          setShowAsTextarea(value);
        }
      });
    }
  }, [question, form, qId]);

  const handleDeleteQuestionButton = (question) => {
    const { id, order } = question;
    api
      .delete(`/question/${id}`)
      .then(() => {
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          const questions = qg.question
            .filter((q) => q.id !== id)
            .map((q) => {
              const newOrder = q.order > order ? q.order - 1 : q.order;
              return {
                ...q,
                order: newOrder,
              };
            });
          return {
            ...qg,
            question: questions,
          };
        });
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: updatedQuestionGroup,
          };
        });
        notify({
          type: "success",
          message: "Question deleted successfully.",
        });
      })
      .catch((e) => {
        const { status, statusText, data } = e.response;
        console.error(status, statusText);
        let messageText = "Oops, something went wrong.";
        if (status === 422) {
          messageText = data?.detail || statusText;
        }
        if (status === 400) {
          messageText = data?.message || statusText;
        }
        notify({
          type: "error",
          message: messageText,
        });
      });
  };

  return (
    <Row
      key={`qe-${qId}`}
      style={{ opacity: question?.deactivate ? "0.3" : "1" }}
    >
      <Col span={24}>
        <Card
          className={
            toggleMove === question.id
              ? "question-card-wrapper is-move"
              : "question-card-wrapper"
          }
        >
          <Row
            align="top"
            justify="space-between"
            gutter={[8, 8]}
            className="sads"
          >
            <Col span={18} align="start" className="left">
              <Collapse ghost activeKey={activePanel}>
                <Panel
                  key={panelKey}
                  showArrow={false}
                  header={
                    <Row align="middle" justify="space-between" gutter={[8, 8]}>
                      <Col span={3}>
                        <Tooltip title="Click to move question">
                          <Button
                            className={
                              activePanel ? "btn-move active" : "btn-move"
                            }
                            type="text"
                            icon={<RiDragMove2Fill />}
                            onClick={() => {
                              store.update((s) => {
                                s.isMoveQuestion = question;
                              });
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Show question details">
                          <Button
                            className={
                              activePanel ? "btn-edit active" : "btn-edit"
                            }
                            type="text"
                            icon={<RiEditFill />}
                            onClick={() => {
                              setActivePanel(panelKey);
                              setActiveSetting("detail");
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Show question details">
                          <Button
                            className="question-number"
                            type="text"
                            size="small"
                            onClick={() => {
                              setActivePanel(panelKey);
                              setActiveSetting("detail");
                            }}
                          >
                            {`Q${index + 1}`}
                          </Button>
                        </Tooltip>
                      </Col>
                      <Col span={21}>
                        {(activeSetting === "detail" ||
                          activeSetting === "setting") && (
                          <QuestionNameInput
                            index={index}
                            question={question}
                          />
                        )}
                        {activeSetting === "translation" && (
                          <TranslationTab
                            activeLang={activeLang}
                            setActiveLang={setActiveLang}
                          />
                        )}
                      </Col>
                    </Row>
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
                      <QuestionTabContent
                        form={form}
                        activeSetting={activeSetting}
                        questionGroup={questionGroup}
                        question={question}
                        handleFormOnValuesChange={handleFormOnValuesChange}
                        allowOther={allowOther}
                        setAllowOther={setAllowOther}
                        allowDecimal={allowDecimal}
                        setAllowDecimal={setAllowDecimal}
                        mandatory={mandatory}
                        setMandatory={setMandatory}
                        personalData={personalData}
                        setPersonalData={setPersonalData}
                        activeLang={activeLang}
                        setActiveLang={setActiveLang}
                        coreMandatory={coreMandatory}
                        setCoreMandatory={setCoreMandatory}
                        setQuestionToDeactivate={setQuestionToDeactivate}
                        questionToDeactivate={questionToDeactivate}
                        datapointName={datapointName}
                        setDatapointName={setDatapointName}
                        allowNA={allowNA}
                        setAllowNA={setAllowNA}
                        isRepeatIdentifierValue={isRepeatIdentifierValue}
                        setIsRepeatIdentifierValue={setIsRepeatIdentifierValue}
                        showAsTextarea={showAsTextarea}
                        setShowAsTextarea={setShowAsTextarea}
                      />
                      <div className="question-button-wrapper">
                        <Space align="center">
                          <Button
                            onClick={() => {
                              setActiveSetting("detail");
                              setActivePanel(null);
                            }}
                          >
                            Close
                          </Button>
                          <Button
                            type="primary"
                            ghost
                            loading={
                              submitStatus === `question-${question?.id}`
                            }
                            onClick={() => {
                              setSubmitStatus(`question-${question?.id}`);
                              setTimeout(() => {
                                form.submit();
                              }, 100);
                            }}
                          >
                            Save
                          </Button>
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col>

            <Col span={6} align="end" className="right">
              <Space align="start">
                <Space direction="vertical" align="start">
                  <Form.Item
                    name={`question-${qId}-type`}
                    rules={[
                      {
                        required: true,
                        message: "Please select question type",
                      },
                    ]}
                  >
                    <Select
                      showSearch={true}
                      className="custom-dropdown-wrapper"
                      placeholder="Question Type"
                      options={question_type?.map((item) => ({
                        label: item
                          .split("_")
                          .map((x) => capitalize(x))
                          .join(" "),
                        value: item,
                      }))}
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={() => setActivePanel(panelKey)}
                      disabled={question?.disableDelete || false}
                    />
                  </Form.Item>
                  <Tag style={{ float: "left" }}>Question ID: {qId}</Tag>
                </Space>
                <Popconfirm
                  title="Delete question can't be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  onConfirm={() => handleDeleteQuestionButton(question)}
                  disabled={question?.disableDelete || false}
                >
                  <Tooltip title="Delete this question">
                    <Button
                      type="text"
                      disabled={question?.disableDelete || false}
                      icon={
                        question?.disableDelete ? (
                          <TbTrashOff />
                        ) : (
                          <RiDeleteBinFill />
                        )
                      }
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionEditor;
