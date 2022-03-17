import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Space,
  Tabs,
  Switch,
  Select,
  Tooltip,
} from "antd";
import { RiSettings5Fill, RiDeleteBinFill } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";
import { AiOutlineGroup } from "react-icons/ai";
import QuestionEditor from "./QuestionEditor";
import { store, api } from "../../lib";
import orderBy from "lodash/orderBy";
import { defaultRepeatingObject, defaultOption } from "../../lib/store";
import { generateID, deleteQuestionOption } from "../../lib/util";

const { TabPane } = Tabs;

const QuestionGroupSetting = ({
  form,
  index,
  questionGroup,
  repeat,
  onChangeRepeat,
}) => {
  const optionValues = store.useState((s) => s?.optionValues);
  const { member_type, isco_type } = optionValues;
  const { id } = questionGroup;
  const formId = questionGroup?.form;

  return (
    <div className="qge-setting-wrapper">
      <Tabs>
        <TabPane tab="Group Settings" key="group-setting">
          <Row
            align="top"
            justify="space-between"
            gutter={[24, 12]}
            className="qge-setting-tab-body"
          >
            <Col span={10}>
              <Form.Item name={`question_group-${formId}-description-${id}`}>
                <Input.TextArea
                  rows={3}
                  placeholder="Question Group Description"
                />
              </Form.Item>
              <Form.Item
                name={`question_group-${formId}-repeat-${id}`}
                hidden
                noStyle
              >
                <Input />
              </Form.Item>
              <Space>
                Repeat{" "}
                <Switch
                  size="small"
                  onChange={(val) =>
                    onChangeRepeat(val, `question_group-repeat-${id}`)
                  }
                  checked={repeat}
                />
              </Space>
            </Col>
            <Col span={7}>
              <Form.Item
                name={`question_group-${formId}-member_access-${id}`}
                rules={[
                  { required: true, message: "Please select member type" },
                ]}
              >
                <Select
                  mode="multiple"
                  showSearch={true}
                  className="custom-dropdown-wrapper"
                  placeholder="Member Type"
                  options={member_type?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  }))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                name={`question_group-${formId}-isco_access-${id}`}
                rules={[{ required: true, message: "Please select isco type" }]}
              >
                <Select
                  mode="multiple"
                  showSearch={true}
                  className="custom-dropdown-wrapper"
                  placeholder="ISCO Type"
                  options={isco_type?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  }))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        {/* <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical" className="qge-setting-tab-body">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Form.Item name={`question_group-skip_logic-${id}`}>
              <Select placeholder="Select question from list" options={[]} />
            </Form.Item>
          </Space>
        </TabPane> */}
      </Tabs>
    </div>
  );
};

const QuestionGroupEditor = ({ index, questionGroup }) => {
  const [form] = Form.useForm();
  const state = store.useState((s) => s?.surveyEditor);
  const formId = state?.id;
  const { deletedOptions } = store.useState((s) => s?.tempStorage);
  const { id, name, question } = questionGroup;
  const isQuestionGroupSaved = id && name;
  const hasQuestion = questionGroup?.question?.length > 0;
  const [isGroupSettingVisible, setIsGroupSettingVisible] = useState(
    !hasQuestion
  );
  const [submitStatus, setSubmitStatus] = useState(null);
  const [repeat, setRepeat] = useState(false);
  const [saveBtnLoading, setSaveBtnLoading] = useState(false);

  useEffect(() => {
    if (questionGroup.id) {
      Object.keys(questionGroup).forEach((key) => {
        const field = `question_group-${formId}-${key}-${id}`;
        const value = questionGroup?.[key];
        form.setFieldsValue({ [field]: value });
        if (key === "repeat") {
          setRepeat(value);
        }
      });
    }
  }, [questionGroup]);

  const onChangeRepeat = (val, fieldId) => {
    form.setFieldsValue({ [fieldId]: val });
    setRepeat(val);
    setTimeout(() => {
      handleFormOnValuesChange(form?.getFieldsValue(), form?.getFieldsValue());
    }, 100);
  };

  const handleAddQuestionButton = (questionGroup) => {
    const qgId = questionGroup?.id;
    api
      .post(`/default_question/${formId}/${qgId}`)
      .then((res) => {
        const { data } = res;
        setIsGroupSettingVisible(false);
        const newQg = {
          ...questionGroup,
          question: [
            ...questionGroup?.question,
            {
              ...data,
              // add option default
              option: [{ ...defaultOption, id: generateID() }],
              // add repeating object default
              repeating_objects: [
                { ...defaultRepeatingObject, id: generateID() },
              ],
            },
          ],
        };
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [
              ...s.surveyEditor.questionGroup.filter((qg) => qg?.id !== qgId),
              newQg,
            ],
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  const handleAddQuestionGroupButton = (questionGroup) => {
    const { id } = state;
    api
      .post(`/default_question_group/${id}`)
      .then((res) => {
        const { data } = res;
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [...s.surveyEditor.questionGroup, data],
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  const handleDeleteQuestionGroupButton = (questionGroup) => {
    const { id } = questionGroup;
    api
      .delete(`/question_group/${id}`)
      .then((res) => {
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: s.surveyEditor.questionGroup.filter(
              (qg) => qg?.id !== id
            ),
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  const handleFormOnFinish = (values) => {
    const { id, order } = questionGroup;
    let qId = null;
    let data = {};
    if (submitStatus === "question-group") {
      Object.keys(values).forEach((key) => {
        const field = key.split("-")[2];
        let val = values[key];
        if (typeof val == "boolean") {
          val = val;
        } else {
          val = val || null;
        }
        data = {
          ...data,
          [field]: val,
        };
      });
      data = {
        ...data,
        form: state?.id,
        order: order,
        translations: null,
        question: null,
      };
      api
        .put(`/question_group/${id}`, data, {
          "content-type": "application/json",
        })
        .then((res) => {
          const { data } = res;
          store.update((s) => {
            s.surveyEditor = {
              ...s.surveyEditor,
              questionGroup: [
                ...s.surveyEditor.questionGroup.filter((x) => x?.id !== id),
                data,
              ],
            };
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          console.error(status, statusText);
        })
        .finally(() => {
          setSubmitStatus(null);
          setSaveBtnLoading(false);
        });
    }
    if (
      submitStatus.includes("question") &&
      !submitStatus?.includes("question-group")
    ) {
      qId = parseInt(submitStatus?.split("-")[1]);
      const findQuestion = questionGroup?.question?.find((q) => q?.id === qId);
      const qgId = findQuestion?.question_group;
      const option = findQuestion?.option?.filter((opt) => opt?.name);
      const repeatingObject = findQuestion?.repeating_objects
        ?.filter((r) => r?.field && r?.value)
        ?.map((r) => ({ field: r?.field, value: r?.value }));
      data = {
        ...findQuestion,
        // option: option?.length > 0 ? option : null,
        option: null,
        repeating_objects: repeatingObject?.length > 0 ? repeatingObject : null,
      };
      // delete question option before update
      deleteQuestionOption(deletedOptions, qId);
      // post option first, then update question
      if (option?.length > 0) {
        option?.forEach((opt) => {
          let optionPayload = {};
          optionPayload = {
            ...optionPayload,
            code: opt?.code,
            name: opt?.name,
            order: opt?.order,
            translations:
              opt?.translations?.length > 0 ? opt?.translations : null,
            question: qId,
          };
          if (opt?.flag === "post") {
            api
              .post(`/option`, optionPayload, {
                "content-type": "application/json",
              })
              .then((res) => {
                console.log("Option created", res?.data);
              })
              .catch((e) => {
                const { status, statusText } = e.response;
                console.error(status, statusText);
              });
          } else {
            api
              .put(`/option/${opt?.id}`, optionPayload, {
                "content-type": "application/json",
              })
              .then((res) => {
                console.log("Option updated", res?.data);
              })
              .catch((e) => {
                const { status, statusText } = e.response;
                console.error(status, statusText);
              });
          }
        });
      }
      api
        .put(`/question/${qId}`, data, {
          "content-type": "application/json",
        })
        .then((res) => {
          const { data } = res;
          store.update((s) => {
            s.surveyEditor = {
              ...s.surveyEditor,
              questionGroup: s.surveyEditor.questionGroup?.map((qg) => {
                if (qg?.id === qgId) {
                  return {
                    ...qg,
                    question: qg?.question?.map((q) => {
                      if (q?.id === qId) {
                        let option = data?.option?.filter((op) => {
                          const checkDelete = deletedOptions?.find(
                            (d) => d?.id === op?.id
                          );
                          if (!checkDelete) {
                            return op;
                          }
                        });
                        let repeating_objects = data?.repeating_objects;
                        // add option default
                        if (option?.length === 0) {
                          option = [{ ...defaultOption, id: generateID() }];
                        }
                        // add repeating object default
                        if (
                          !repeating_objects ||
                          repeating_objects?.length === 0
                        ) {
                          repeating_objects = [
                            { ...defaultRepeatingObject, id: generateID() },
                          ];
                        }
                        return {
                          ...data,
                          option: option,
                          repeating_objects: repeating_objects,
                        };
                      }
                      return q;
                    }),
                  };
                }
                return qg;
              }),
            };
          });
          store.update((s) => {
            s.tempStorage = {
              ...s.tempStorage,
              deletedOptions: [],
            };
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          console.error(status, statusText);
        })
        .finally(() => {
          setSubmitStatus(null);
        });
    }
  };

  const handleFormOnValuesChange = (values, allValues) => {
    console.log("onFormChangeValue", values);
    const question = questionGroup?.question;
    Object.keys(values).forEach((key) => {
      const field = key.split("-")[2];
      const value = values?.[key];
      if (key.includes("question_group")) {
        let findQuestionGroup = questionGroup;
        findQuestionGroup = {
          ...findQuestionGroup,
          [field]: value,
        };
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [
              ...s.surveyEditor?.questionGroup?.filter(
                (x) => x?.id !== questionGroup?.id
              ),
              findQuestionGroup,
            ],
          };
        });
      }
      if (key.includes("question") && !key.includes("question_group")) {
        const qid = parseInt(key.split("-")[1]);
        // update question state
        let findQuestion = question?.find((q) => q?.id === qid);
        if (
          ![
            "option",
            "repeating_objects_field",
            "repeating_objects_value",
            "rule",
          ].includes(field)
        ) {
          findQuestion = {
            ...findQuestion,
            [field]: value,
          };
        }
        if (field.includes("option")) {
          const optId = key.split("-")[3];
          findQuestion = {
            ...findQuestion,
            option: findQuestion?.option?.map((opt) => {
              if (opt?.id == optId) {
                return {
                  ...opt,
                  name: value,
                };
              }
              return opt;
            }),
          };
        }
        if (field.includes("repeating_objects")) {
          const roId = key.split("-")[3];
          const roKey = field.split("_")[2];
          findQuestion = {
            ...findQuestion,
            repeating_objects: findQuestion?.repeating_objects?.map((ro) => {
              if (ro?.id == roId) {
                return {
                  ...ro,
                  [roKey]: value,
                };
              }
              return ro;
            }),
          };
        }
        if (field.includes("rule")) {
          const ruleType = key.split("-")[3];
          findQuestion = {
            ...findQuestion,
            rule: {
              ...findQuestion?.rule,
              [ruleType]: value,
            },
          };
        }
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [
              ...s.surveyEditor?.questionGroup?.filter(
                (x) => x?.id !== questionGroup?.id
              ),
              {
                ...questionGroup,
                question: [
                  ...questionGroup?.question?.filter((x) => x?.id !== qid),
                  findQuestion,
                ],
              },
            ],
          };
        });
      }
    });
  };

  const handleFormOnFinishFailed = ({ values }) => {
    setSubmitStatus(null);
    setSaveBtnLoading(false);
    console.log("Failed", values);
  };

  return (
    <Row
      key={`qge-${index}`}
      className="question-group-editor-wrapper"
      align="bottom"
      justify="space-between"
      gutter={[40, 12]}
    >
      <Col span={22}>
        <Form
          form={form}
          name="survey-detail"
          onValuesChange={(values, allValues) => {
            handleFormOnValuesChange(values, allValues);
          }}
          onFinish={handleFormOnFinish}
          onFinishFailed={handleFormOnFinishFailed}
        >
          <Card className="qge-card-wrapper">
            <Row
              className="section-title-row"
              align="middle"
              justify="space-between"
            >
              <Col span={18} align="start" className="left">
                <Form.Item
                  name={`question_group-${formId}-name-${id}`}
                  rules={[
                    { required: true, message: "Please input section title" },
                  ]}
                >
                  <Input placeholder="Section Title" />
                </Form.Item>
              </Col>
              <Col span={6} align="end" className="right">
                <Space size={1} align="center">
                  <Button
                    type="text"
                    icon={<RiSettings5Fill />}
                    onClick={() =>
                      setIsGroupSettingVisible(!isGroupSettingVisible)
                    }
                  />
                  <Button
                    type="text"
                    icon={<RiDeleteBinFill />}
                    onClick={() =>
                      handleDeleteQuestionGroupButton(questionGroup)
                    }
                  />
                </Space>
              </Col>
            </Row>
            {isGroupSettingVisible ? (
              <>
                <QuestionGroupSetting
                  form={form}
                  index={index}
                  questionGroup={questionGroup}
                  repeat={repeat}
                  onChangeRepeat={onChangeRepeat}
                />
                <div className="qge-button-wrapper">
                  <Space align="center">
                    <Button
                      type="primary"
                      ghost
                      loading={saveBtnLoading}
                      onClick={() => {
                        setSaveBtnLoading(true);
                        setSubmitStatus("question-group");
                        setTimeout(() => {
                          form.submit();
                        }, 100);
                      }}
                    >
                      Save
                    </Button>
                  </Space>
                </div>
              </>
            ) : (
              orderBy(question, ["order"]).map((q, qi) => (
                <QuestionEditor
                  key={`question-key-${qi + 1}`}
                  form={form}
                  index={qi + 1}
                  question={q}
                  questionGroup={questionGroup}
                  handleFormOnValuesChange={handleFormOnValuesChange}
                  submitStatus={submitStatus}
                  setSubmitStatus={setSubmitStatus}
                />
              ))
            )}
          </Card>
        </Form>
      </Col>
      {/* Button Add Section & Question */}
      <Col span={2} align="center">
        <Card className="button-control-wrapper">
          <Space align="center" direction="vertical">
            {isQuestionGroupSaved && (
              <Tooltip title="Add question">
                <Button
                  ghost
                  icon={<HiPlus />}
                  onClick={() => handleAddQuestionButton(questionGroup)}
                />
              </Tooltip>
            )}
            <Tooltip title="Add section">
              <Button
                ghost
                icon={<AiOutlineGroup />}
                onClick={() => handleAddQuestionGroupButton(questionGroup)}
              />
            </Tooltip>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionGroupEditor;
