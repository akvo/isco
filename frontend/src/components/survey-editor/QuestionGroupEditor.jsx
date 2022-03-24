import React, { useState, useEffect, useCallback } from "react";
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
  Popconfirm,
} from "antd";
import {
  RiSettings5Fill,
  RiDeleteBinFill,
  RiListOrdered,
} from "react-icons/ri";
import { AiOutlineGroup } from "react-icons/ai";
import { MdGTranslate } from "react-icons/md";
import { store, api } from "../../lib";
import orderBy from "lodash/orderBy";
import { defaultRepeatingObject, defaultOption } from "../../lib/store";
import { generateID } from "../../lib/util";
import { isoLangs } from "../../lib";
import { useNotification } from "../../util";
import Question from "./Question";

const { TabPane } = Tabs;

const QuestionGroupSetting = ({
  form,
  questionGroup,
  repeat,
  onChangeRepeat,
}) => {
  const state = store.useState((s) => s?.surveyEditor);
  const optionValues = store.useState((s) => s?.optionValues);
  const { member_type, isco_type } = optionValues;
  const { languages } = state;
  const qgId = questionGroup?.id;
  const { name, description } = questionGroup;
  const [groupTranslationVisible, setGroupTranslationVisible] = useState(false);

  const memberAccessField = `question_group-${qgId}-member_access`;
  const memberValue = form.getFieldValue(memberAccessField);
  const memberOption = member_type?.map((item) => {
    // disabled other value if all selected / id === 1
    if (memberValue && memberValue?.includes(1)) {
      return {
        label: item?.name,
        value: item?.id,
        disabled: true,
      };
    }
    return {
      label: item?.name,
      value: item?.id,
    };
  });

  const iscoAccessField = `question_group-${qgId}-isco_access`;
  const iscoValue = form.getFieldValue(iscoAccessField);
  const iscoOption = isco_type?.map((item) => {
    // disabled other value if all selected / id === 1
    if (iscoValue && iscoValue?.includes(1)) {
      return {
        label: item?.name,
        value: item?.id,
        disabled: true,
      };
    }
    return {
      label: item?.name,
      value: item?.id,
    };
  });

  return (
    <div className="qge-setting-wrapper">
      <Tabs
        tabBarExtraContent={
          groupTranslationVisible ? (
            <Tooltip title="Show section setting">
              <Button
                icon={<RiSettings5Fill />}
                type="text"
                onClick={() => setGroupTranslationVisible(false)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Show section translation setting">
              <Button
                icon={<MdGTranslate />}
                type="text"
                onClick={() => setGroupTranslationVisible(true)}
              />
            </Tooltip>
          )
        }
      >
        {/* Group setting */}
        {!groupTranslationVisible && (
          <>
            <TabPane tab="Section Settings" key="group-setting">
              <Row
                align="top"
                justify="space-between"
                gutter={[24, 12]}
                className="qge-setting-tab-body"
              >
                <Col span={10}>
                  <div className="field-wrapper">
                    <div className="field-label">Section Description</div>
                    <Form.Item name={`question_group-${qgId}-description`}>
                      <Input.TextArea
                        rows={3}
                        placeholder="Type section description here..."
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name={`question_group-${qgId}-repeat`}
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
                        onChangeRepeat(val, `question_group-${qgId}-repeat`)
                      }
                      checked={repeat}
                    />
                  </Space>
                </Col>
                <Col span={7}>
                  <div className="field-wrapper">
                    <div className="field-label">Member Type</div>
                    <Form.Item
                      name={memberAccessField}
                      rules={[
                        {
                          required: true,
                          message: "Please select member type",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        mode="multiple"
                        showSearch={true}
                        className="custom-dropdown-wrapper"
                        placeholder="Select Member Type"
                        options={memberOption}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      />
                    </Form.Item>
                  </div>
                </Col>
                <Col span={7}>
                  <div className="field-wrapper">
                    <div className="field-label">ISCO Type</div>
                    <Form.Item
                      name={iscoAccessField}
                      rules={[
                        { required: true, message: "Please select isco type" },
                      ]}
                    >
                      <Select
                        allowClear
                        mode="multiple"
                        showSearch={true}
                        className="custom-dropdown-wrapper"
                        placeholder="Select ISCO Type"
                        options={iscoOption}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </TabPane>
            {/* <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical" className="qge-setting-tab-body">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Form.Item name={`question_group-${qgId}-skip_logic`}>
              <Select placeholder="Select question from list" options={[]} />
            </Form.Item>
          </Space>
        </TabPane> */}
          </>
        )}

        {/* Translation  */}
        {groupTranslationVisible &&
          languages?.map((lang, li) => (
            <TabPane key={`group-${lang}-${li}`} tab={isoLangs?.[lang]?.name}>
              <div className="qge-setting-tab-body">
                <Form.Item
                  label={<div className="translation-label">{name}</div>}
                  name={`question_group-${qgId}-translations-${lang}-name`}
                >
                  <Input
                    placeholder={`Enter ${isoLangs?.[lang]?.name} translation`}
                  />
                </Form.Item>
              </div>
              {description && (
                <div className="qge-setting-tab-body">
                  <Form.Item
                    label={
                      <div className="translation-label">{description}</div>
                    }
                    name={`question_group-${qgId}-translations-${lang}-description`}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={`Enter ${isoLangs?.[lang]?.name} translation`}
                    />
                  </Form.Item>
                </div>
              )}
            </TabPane>
          ))}
      </Tabs>
    </div>
  );
};

const QuestionGroupEditor = ({ index, questionGroup }) => {
  const [form] = Form.useForm();
  const state = store.useState((s) => s?.surveyEditor);
  const { deletedOptions, deletedSkipLogic } = store.useState(
    (s) => s?.tempStorage
  );
  const { id, question } = questionGroup;
  const isQuestionGroupHasQuestion = question?.length > 0;
  const [isGroupSettingVisible, setIsGroupSettingVisible] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [repeat, setRepeat] = useState(false);
  const [saveBtnLoading, setSaveBtnLoading] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    if (questionGroup.id) {
      Object.keys(questionGroup).forEach((key) => {
        const field = `question_group-${id}-${key}`;
        const value = questionGroup?.[key];
        if (key !== "question" && key !== "translations") {
          form.setFieldsValue({ [field]: value });
        }
        // Load translations
        if (key !== "question" && key === "translations") {
          value?.forEach((val) => {
            const lang = val?.language;
            Object.keys(val).forEach((key) => {
              const transField = `${field}-${lang}-${key}`;
              form.setFieldsValue({ [transField]: val?.[key] });
            });
          });
        }
        if (key === "repeat") {
          setRepeat(value);
        }
      });
    }
  }, [questionGroup, form, id]);

  const handleShowQuestionButton = () => {
    setIsGroupSettingVisible(false);
    setIsQuestionVisible(!isQuestionVisible);
  };

  const handleShowQuestionGroupSettingButton = () => {
    setIsQuestionVisible(false);
    setIsGroupSettingVisible(true);
  };

  const onChangeRepeat = (val, fieldId) => {
    const repeatFieldValue = { [fieldId]: val };
    form.setFieldsValue(repeatFieldValue);
    setRepeat(val);
    setTimeout(() => {
      handleFormOnValuesChange(repeatFieldValue, form?.getFieldsValue());
    }, 100);
  };

  const handleAddQuestionGroupButton = () => {
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
      .then(() => {
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: s.surveyEditor.questionGroup.filter(
              (qg) => qg?.id !== id
            ),
          };
        });
        notify({
          type: "success",
          message: "Section deleted successfully.",
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        if (status === 422) {
          notify({
            type: "warning",
            message:
              "This section has question used as a dependency for other question",
          });
        } else {
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        }
      });
  };

  const handleFormOnFinish = () => {
    const { id } = questionGroup;
    let qId = null;
    let data = {};
    // Save Question Group
    if (submitStatus === "question-group") {
      const findQuestionGroup = questionGroup;
      data = {
        ...findQuestionGroup,
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
          notify({
            type: "success",
            message: "Section saved successfully.",
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          console.error(status, statusText);
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        })
        .finally(() => {
          setSubmitStatus(null);
          setSaveBtnLoading(false);
        });
    }
    // Save Question
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
      const skipLogic = findQuestion?.skip_logic;

      data = {
        ...findQuestion,
        option: null,
        repeating_objects: repeatingObject?.length > 0 ? repeatingObject : null,
        skip_logic: null,
        cascade: findQuestion?.cascade || null,
      };

      /**
       * * add member/isco access value inherited from question group,
       * * this will be changed in the future, to get member/isco value from dropdown on question editor */
      data = {
        ...data,
        member_access: questionGroup?.member_access,
        isco_access: questionGroup?.isco_access,
      };

      // delete question option before update
      let optionToDelete = deletedOptions;
      if (qId) {
        optionToDelete = optionToDelete?.filter((x) => x?.question === qId);
      }
      optionToDelete?.forEach((opt) => {
        const { id } = opt;
        api
          .delete(`/option/${id}`)
          .then((res) => {
            store.update((s) => {
              s.tempStorage = {
                ...s.tempStorage,
                deletedOptions: s.tempStorage.deletedOptions?.filter(
                  (x) => x?.id !== res?.id
                ),
              };
            });
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            console.error(status, statusText);
          });
      });

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
              .catch((e) => {
                const { status, statusText } = e.response;
                console.error(status, statusText);
              });
          } else {
            api
              .put(`/option/${opt?.id}`, optionPayload, {
                "content-type": "application/json",
              })
              .catch((e) => {
                const { status, statusText } = e.response;
                console.error(status, statusText);
              });
          }
        });
      }

      // delete skip logic
      let toDelete = deletedSkipLogic;
      if (qId) {
        toDelete = toDelete?.filter((x) => x?.question === qId);
      }
      toDelete?.forEach((item) => {
        const { id } = item;
        api
          .delete(`/skip_logic/${id}`)
          .then((res) => {
            store.update((s) => {
              s.tempStorage = {
                ...s.tempStorage,
                deletedSkipLogic: s.tempStorage.deletedSkipLogic?.filter(
                  (x) => x?.id !== res?.id
                ),
              };
            });
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            console.error(status, statusText);
          });
      });

      // post skip logic
      if (skipLogic?.length > 0) {
        skipLogic?.forEach((ski) => {
          const skipPayload = {
            question: ski?.question,
            dependent_to: ski?.dependent_to,
            operator: ski?.operator,
            value: Array.isArray(ski?.value)
              ? ski?.value?.join("|")
              : String(ski?.value),
            type: ski?.type,
          };
          if (ski?.flag === "post") {
            api
              .post(`/skip_logic`, skipPayload, {
                "content-type": "application/json",
              })
              .catch((e) => {
                const { status, statusText } = e.response;
                console.error(status, statusText);
              });
          } else {
            api
              .put(`/skip_logic/${ski?.id}`, skipPayload, {
                "content-type": "application/json",
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
          notify({
            type: "success",
            message: "Question saved successfully.",
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          console.error(status, statusText);
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        })
        .finally(() => {
          setSubmitStatus(null);
        });
    }
  };

  const handleFormOnValuesChange = (values /*allValues*/) => {
    const question = questionGroup?.question;
    Object.keys(values).forEach((key) => {
      const field = key.split("-")[2];
      const value = values?.[key];
      // Handle Question group
      if (key.includes("question_group")) {
        let findQuestionGroup = questionGroup;
        if (!field?.includes("translations")) {
          findQuestionGroup = {
            ...findQuestionGroup,
            [field]: value,
          };
        }
        if (field?.includes("translations")) {
          const lang = key.split("-")[3];
          const tKey = key.split("-")[4];
          const transFilter = findQuestionGroup?.translations?.filter(
            (x) => x?.language !== lang
          );
          findQuestionGroup = {
            ...findQuestionGroup,
            translations: [
              ...transFilter,
              {
                ...findQuestionGroup?.translations?.find(
                  (x) => x?.language === lang
                ),
                language: lang,
                [tKey]: value,
              },
            ],
          };
        }

        const filterQuestionGroup = state?.questionGroup?.filter(
          (x) => x?.id !== questionGroup?.id
        );
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [...filterQuestionGroup, findQuestionGroup],
          };
        });
      }
      // Handle Question
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
            "skip_logic",
            "translations",
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
              if (String(opt?.id) === String(optId)) {
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
              if (String(ro?.id) === String(roId)) {
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
        if (field.includes("skip_logic")) {
          const skipKey = key.split("-")[3];
          findQuestion = {
            ...findQuestion,
            skip_logic: skipKey
              ? [
                  {
                    ...findQuestion?.skip_logic[0],
                    flag: findQuestion?.skip_logic[0]?.id || "post",
                    question: qid,
                    [skipKey]: value,
                  },
                ]
              : null,
          };
        }
        if (field.includes("translations") && !key.includes("option")) {
          const lang = key.split("-")[3];
          const tKey = key.split("-")[4];
          const transFilter = findQuestion?.translations?.filter(
            (x) => x?.language !== lang
          );
          findQuestion = {
            ...findQuestion,
            translations: [
              ...transFilter,
              {
                ...findQuestion?.translations?.find(
                  (x) => x?.language === lang
                ),
                language: lang,
                [tKey]: value,
              },
            ],
          };
        }
        if (field.includes("translations") && key.includes("option")) {
          const lang = key.split("-")[3];
          const tKey = key.split("-")[4];
          const optId = parseInt(key.split("-")[5]);
          const optKey = tKey.split("_")[1];
          const updatedQuestionOption = findQuestion?.option?.map((opt) => {
            if (opt?.id === optId) {
              const filterOption = opt?.translations?.filter(
                (x) => x?.language !== lang
              );
              return {
                ...opt,
                translations: [
                  ...filterOption,
                  {
                    ...opt?.translations?.find((x) => x?.language === lang),
                    language: lang,
                    [optKey]: value,
                  },
                ],
              };
            }
            return opt;
          });
          findQuestion = {
            ...findQuestion,
            option: [...updatedQuestionOption],
          };
        }

        const filterQuestionGroup = state?.questionGroup?.filter(
          (x) => x?.id !== questionGroup?.id
        );
        const filterQuestion = questionGroup?.question?.filter(
          (x) => x?.id !== qid
        );
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [
              ...filterQuestionGroup,
              {
                ...questionGroup,
                question: [...filterQuestion, findQuestion],
              },
            ],
          };
        });
      }
    });
  };

  const handleFormOnFinishFailed = () => {
    setSubmitStatus(null);
    setSaveBtnLoading(false);
  };

  return (
    <Row
      key={`qge-${index}`}
      className="question-group-editor-wrapper"
      align="bottom"
      justify="space-between"
      gutter={[12, 12]}
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
                  name={`question_group-${id}-name`}
                  rules={[
                    { required: true, message: "Please input section title" },
                  ]}
                >
                  <Input size="large" placeholder="Section Title" />
                </Form.Item>
              </Col>
              <Col span={6} align="end" className="right">
                <Space size={1} align="center">
                  <Tooltip
                    title={`${
                      isQuestionGroupHasQuestion
                        ? "Show/hide section question"
                        : "This section doesn't have question"
                    }`}
                  >
                    <Button
                      disabled={!isQuestionGroupHasQuestion}
                      type="text"
                      icon={<RiListOrdered />}
                      onClick={() => handleShowQuestionButton()}
                    />
                  </Tooltip>
                  <Tooltip title="Show section setting">
                    <Button
                      type="text"
                      icon={<RiSettings5Fill />}
                      onClick={() => handleShowQuestionGroupSettingButton()}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Delete section can't be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() =>
                      handleDeleteQuestionGroupButton(questionGroup)
                    }
                  >
                    <Tooltip title="Delete this section">
                      <Button type="text" icon={<RiDeleteBinFill />} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              </Col>
            </Row>
            {isGroupSettingVisible && (
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
                      ghost
                      onClick={() => setIsGroupSettingVisible(false)}
                    >
                      Close
                    </Button>
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
            )}
            {isQuestionVisible && (
              <div className="question-editor-wrapper">
                {orderBy(question, ["order"]).map((q, qi) => (
                  <Question
                    key={`question-${q?.id}`}
                    index={qi}
                    form={form}
                    question={q}
                    questionGroup={questionGroup}
                    handleFormOnValuesChange={handleFormOnValuesChange}
                    submitStatus={submitStatus}
                    setSubmitStatus={setSubmitStatus}
                  />
                ))}
              </div>
            )}
          </Card>
        </Form>
      </Col>
      {/* Button Add Section & Question */}
      <Col span={1.5} align="center">
        <Card className="button-control-wrapper">
          <Space align="center" direction="vertical">
            {/* {isQuestionGroupSaved && (
              <Tooltip title="Add question">
                <Button
                  ghost
                  icon={<HiPlus />}
                  onClick={() => handleAddQuestionButton(questionGroup)}
                />
              </Tooltip>
            )} */}
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
