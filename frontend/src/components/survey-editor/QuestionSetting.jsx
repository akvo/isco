import React, { useState, useMemo } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Button,
  Space,
  Tabs,
  Switch,
  Select,
  Tooltip,
  Alert,
  Popconfirm,
} from "antd";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { RiDeleteBinFill } from "react-icons/ri";
import {
  MdOutlineRadioButtonChecked,
  MdOutlineLibraryAddCheck,
} from "react-icons/md";
import { store } from "../../lib";
import { orderBy, take } from "lodash";
import { generateDisabledOptions } from "./QuestionGroupEditor";

const { TabPane } = Tabs;

const skipLogicQuestionType = ["option", "number", "multiple_option"];
const datapointNameQuestionType = ["input", "option"];
const allowNAQuestionType = ["number", "text", "input"];

const QuestionSetting = ({
  form,
  question,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  handleFormOnValuesChange,
  allowDecimal,
  setAllowDecimal,
  coreMandatory,
  setCoreMandatory,
  questionToDeactivate,
  setQuestionToDeactivate,
  datapointName,
  setDatapointName,
  allowNA,
  setAllowNA,
  isRepeatIdentifierValue,
  setIsRepeatIdentifierValue,
}) => {
  const [deactivatePopconfirmMessage, setDeactivatePopconfirmMessage] =
    useState("");
  const [deactivatePopconfirmVisible, setDeactivatePopconfirmVisible] =
    useState(false);
  const { surveyEditor, tempStorage, optionValues } = store.useState((s) => s);
  const { questionGroup: questionGroupState } = surveyEditor;
  const { operator_type, member_type, isco_type } = optionValues;
  const {
    id: qid,
    type: currentQuestionType,
    question_group: currentQuestionGroupId,
  } = question;

  const memberAccessField = `question-${qid}-member_access`;
  const memberValue = form.getFieldValue(memberAccessField);
  const memberOption = useMemo(() => {
    return generateDisabledOptions(member_type, memberValue);
  }, [memberValue, member_type]);

  const iscoAccessField = `question-${qid}-isco_access`;
  const iscoValue = form.getFieldValue(iscoAccessField);
  const iscoOption = useMemo(() => {
    return generateDisabledOptions(isco_type, iscoValue);
  }, [iscoValue, isco_type]);

  const allQuestion = useMemo(() => {
    return orderBy(
      questionGroupState?.flatMap((qg) => qg?.question),
      ["order"]
    );
  }, [questionGroupState]);

  const dependencies = useMemo(() => {
    return allQuestion.filter(
      (q) =>
        q?.skip_logic?.filter((d) => d.dependent_to === qid).length || false
    );
  }, [allQuestion, qid]);

  // take skip logic question by question current order
  const skipLogicQuestion = useMemo(() => {
    return orderBy(
      take(allQuestion, question?.order)?.filter(
        (q) => skipLogicQuestionType.includes(q?.type) && q?.id !== qid
      ),
      ["order"]
    )?.map((q) => {
      let icon = <AiOutlineFieldNumber style={{ marginRight: "8px" }} />;
      if (q?.type === "option") {
        icon = <MdOutlineRadioButtonChecked style={{ marginRight: "8px" }} />;
      }
      if (q?.type === "multiple_option") {
        icon = <MdOutlineLibraryAddCheck style={{ marginRight: "8px" }} />;
      }
      return {
        disabled: q.deactivate,
        label: (
          <Row align="middle">
            {icon} {q?.name}
          </Row>
        ),
        text: q?.name,
        value: q?.id,
      };
    });
  }, [allQuestion, qid, question?.order]);

  // handle dependencies
  const dependentId = parseInt(
    form?.getFieldValue(`question-${qid}-skip_logic-dependent_to`)
  );
  const dependentQuestion = useMemo(() => {
    return allQuestion?.find((q) => q?.id === dependentId);
  }, [allQuestion, dependentId]);
  const operators = useMemo(() => {
    return dependentQuestion?.type.includes("option")
      ? operator_type?.filter((x) => x === "equal")
      : operator_type;
  }, [dependentQuestion, operator_type]);

  // handle leading_question -> is_repeat_identifier
  const isQuestionInsideRepeatGroup = useMemo(() => {
    const findGroup = questionGroupState.find(
      (qg) => qg.id === currentQuestionGroupId
    );
    if (findGroup && findGroup?.repeat && findGroup?.leading_question) {
      return true;
    }
    return false;
  }, [questionGroupState, currentQuestionGroupId]);

  const handleRequiredChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setMandatory(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleDeactivateChange = (val, field) => {
    const allQuestion = orderBy(
      questionGroupState?.flatMap((qg) => qg?.question),
      ["order"]
    );
    const allSkipLogic = allQuestion.map((item) => item.skip_logic).flat();
    const findDependant = allSkipLogic.find(
      (item) => item.dependent_to === qid
    );
    const dependentQuestion = allQuestion?.find(
      (q) => q?.id === findDependant?.question
    );
    if (
      dependentQuestion &&
      !dependentQuestion.deactivate &&
      !question.deactivate
    ) {
      setDeactivatePopconfirmVisible(true);
      const field = `question-${dependentQuestion?.id}-deactivate`;
      const fieldValue = { [field]: val };
      form.setFieldsValue(fieldValue);
      const data = [{ ...question }];
      allQuestion.map((item) => {
        const find = item?.skip_logic?.find((d) => d.dependent_to === qid);
        if (find) {
          data.push({ ...item });
        } else {
          data.map((inner) => {
            const find = item?.skip_logic?.find(
              (d) => d.dependent_to === inner.id
            );
            if (find) {
              data.push({ ...item });
            }
          });
        }
      });
      setQuestionToDeactivate(
        data?.map((item) => {
          return {
            ...item,
            deactivate: !item.deactivate,
          };
        })
      );
      // create warning message for deactivate popconfirm
      const dependencyPopconfirmList = (
        <ul>
          {data
            .filter((d) => d?.id !== qid)
            .map(({ id, name }) => (
              <li key={`li-${id}`}>{name}</li>
            ))}
        </ul>
      );
      setDeactivatePopconfirmMessage(
        <div>
          {question?.name} has dependency on:
          {dependencyPopconfirmList}
          Do you still want to deactivate?
        </div>
      );
      return false;
    }
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    const updatedQuestionGroup = questionGroupState.map((qg) => {
      const questions = qg.question.map((q) => {
        return {
          ...q,
          deactivate:
            q.id === question?.id ? !question?.deactivate : q.deactivate,
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
    setQuestionToDeactivate([
      {
        ...question,
        deactivate: val,
      },
    ]);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleCoreMandatoryChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setCoreMandatory(val);
    // Any question that is marked as core mandatory is automatically marked as mandatory
    if (val && !mandatory) {
      const fieldMandatoryValue = { [`question-${qid}-mandatory`]: true };
      form.setFieldsValue(fieldMandatoryValue);
      setMandatory(true);
    }
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handlePersonalDataChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setPersonalData(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleDatapointNameChange = (val, field) => {
    const { checked } = val.target;
    const fieldValue = { [field]: checked };
    form.setFieldsValue(fieldValue);
    setDatapointName(checked);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleAllowDecimalChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowDecimal(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleAllowNAChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowNA(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleIsRepeatIdentifierChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setIsRepeatIdentifierValue(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleOnDeleteSkipLogic = () => {
    const skipLogic = question?.skip_logic?.[0];
    const fields = ["dependent_to", "operator", "value"].map(
      (x) => `question-${qid}-skip_logic-${x}`
    );
    form.resetFields(fields);
    handleFormOnValuesChange(
      { [`question-${qid}-skip_logic`]: null },
      form?.getFieldsValue()
    );
    // store removed skip logic to delete when save button clicked
    const filterTempStorage = tempStorage.deletedSkipLogic?.filter(
      (x) => x?.id !== skipLogic?.id
    );
    store.update((s) => {
      s.tempStorage = {
        ...s.tempStorage,
        deletedSkipLogic: [...filterTempStorage, skipLogic],
      };
    });
  };

  const handleOkDeactivatePopconfirm = (data) => {
    setDeactivatePopconfirmVisible(false);
    let updatedQuestionGroup = [...questionGroupState];
    data?.map((item) => {
      updatedQuestionGroup = updatedQuestionGroup.map((qg) => {
        const questions = qg.question.map((q) => {
          return {
            ...q,
            deactivate: q.id === item?.id ? item?.deactivate : q.deactivate,
          };
        });
        return {
          ...qg,
          question: questions,
        };
      });
    });
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: updatedQuestionGroup,
      };
    });
  };

  const handleCancelDeactivatePopconfirm = () => {
    setDeactivatePopconfirmVisible(false);
    setQuestionToDeactivate([]);
  };

  const handleChangeQuestionSkipLogicDependentTo = () => {
    setTimeout(() => {
      form.resetFields([
        `question-${qid}-skip_logic-operator`,
        `question-${qid}-skip_logic-value-number`,
        `question-${qid}-skip_logic-value-option`,
      ]);
    }, [250]);
  };

  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
        {/* Question Options */}
        <TabPane tab="Settings" key="question-option">
          <>
            {dependencies?.length > 0 && (
              <Row className="dependency-row">
                <Alert
                  message={
                    <div>
                      <ul className="arfe-dependant-list-box">
                        Dependant Questions:
                        {dependencies.map((group) => (
                          <li key={group?.id}>
                            {`${
                              questionGroupState?.find(
                                (item) => item.id === group.question_group
                              )?.order
                            } ${
                              questionGroupState?.find(
                                (item) => item.id === group.question_group
                              )?.name
                            }`}
                            <ul>
                              <li>
                                {group?.order}. {group?.name}
                              </li>
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                  type="info"
                />
              </Row>
            )}
            <Row align="middle" justify="start" gutter={[12, 12]}>
              <Col span={9}>
                <div className="field-wrapper">
                  <div className="field-label">Member Type</div>
                  <Form.Item name={memberAccessField}>
                    <Select
                      allowClear
                      mode="multiple"
                      showSearch={true}
                      className="custom-dropdown-wrapper bg-grey"
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
              <Col span={9}>
                <div className="field-wrapper">
                  <div className="field-label">ISCO</div>
                  <Form.Item name={iscoAccessField}>
                    <Select
                      allowClear
                      mode="multiple"
                      showSearch={true}
                      className="custom-dropdown-wrapper bg-grey"
                      placeholder="Select ISCO"
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
            <div className="field-wrapper">
              <div className="field-label">Variable name (Custom ID)</div>
              <Form.Item name={`question-${qid}-variable_name`}>
                <Input
                  className="bg-grey"
                  placeholder="Enter variable name (Custom ID)"
                />
              </Form.Item>
            </div>
            <div className="field-wrapper">
              <div className="field-label">Tooltip</div>
              <Form.Item name={`question-${qid}-tooltip`}>
                <Input className="bg-grey" placeholder="Enter tooltip" />
              </Form.Item>
            </div>
            <Space size={65}>
              <div>
                <Popconfirm
                  placement="topRight"
                  title={() => deactivatePopconfirmMessage}
                  onConfirm={() =>
                    handleOkDeactivatePopconfirm(questionToDeactivate)
                  }
                  onCancel={handleCancelDeactivatePopconfirm}
                  visible={deactivatePopconfirmVisible}
                  style={{ whiteSpace: "break-spaces'" }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Form.Item name={`question-${qid}-deactivate`} hidden noStyle>
                    <Input />
                  </Form.Item>
                  Deactivate{" "}
                  <Switch
                    key={`question-${qid}-deactivate-switch`}
                    size="small"
                    checked={question?.deactivate}
                    onChange={(val) =>
                      handleDeactivateChange(val, `question-${qid}-deactivate`)
                    }
                  />
                </Popconfirm>
              </div>
              <div>
                <Form.Item name={`question-${qid}-mandatory`} hidden noStyle>
                  <Input />
                </Form.Item>
                Required{" "}
                <Switch
                  key={`question-${qid}-mandatory-switch`}
                  size="small"
                  checked={mandatory}
                  disabled={coreMandatory}
                  onChange={(val) =>
                    handleRequiredChange(val, `question-${qid}-mandatory`)
                  }
                />
              </div>
              <div>
                <Form.Item
                  name={`question-${qid}-core_mandatory`}
                  hidden
                  noStyle
                >
                  <Input />
                </Form.Item>
                Core Mandatory{" "}
                <Switch
                  key={`question-${qid}-core_mandatory-switch`}
                  size="small"
                  checked={coreMandatory}
                  disabled={allowNA}
                  onChange={(val) =>
                    handleCoreMandatoryChange(
                      val,
                      `question-${qid}-core_mandatory`
                    )
                  }
                />
              </div>
              <div>
                <Form.Item
                  name={`question-${qid}-personal_data`}
                  hidden
                  noStyle
                >
                  <Input />
                </Form.Item>
                Personal data{" "}
                <Switch
                  key={`question-${qid}-personal_data-switch`}
                  size="small"
                  checked={personalData}
                  onChange={(val) =>
                    handlePersonalDataChange(
                      val,
                      `question-${qid}-personal_data`
                    )
                  }
                />
              </div>
            </Space>
            {
              // Set question as datapoint/display name
              datapointNameQuestionType.includes(currentQuestionType) && (
                <div className="field-wrapper" style={{ marginTop: "20px" }}>
                  <Form.Item name={`question-${qid}-datapoint_name`}>
                    <Checkbox
                      key={`question-${qid}-datapoint_name-checkbox`}
                      checked={datapointName}
                      onChange={(val) =>
                        handleDatapointNameChange(
                          val,
                          `question-${qid}-datapoint_name`
                        )
                      }
                    >
                      {" "}
                      Use as data point / display name{" "}
                    </Checkbox>
                  </Form.Item>
                </div>
              )
            }
            {
              /* ALLOW NA SETTING */
              allowNAQuestionType.includes(currentQuestionType) && (
                <div className="field-wrapper" style={{ marginTop: "20px" }}>
                  <Form.Item
                    name={`question-${qid}-rule-allowNA`}
                    hidden
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                  <Checkbox
                    key={`question-${qid}-rule-allowNA-checkbox`}
                    checked={allowNA}
                    disabled={coreMandatory}
                    onChange={(val) =>
                      handleAllowNAChange(
                        val?.target?.checked,
                        `question-${qid}-rule-allowNA`
                      )
                    }
                  >
                    {" "}
                    Allow Data unavailable/NA
                  </Checkbox>
                </div>
              )
            }
            {
              /* IS REPEAT IDENTIFIER SETTING */
              isQuestionInsideRepeatGroup && (
                <div className="field-wrapper" style={{ marginTop: "20px" }}>
                  <Form.Item
                    name={`question-${qid}-is_repeat_identifier`}
                    hidden
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                  <Checkbox
                    key={`question-${qid}-is_repeat_identifier-checkbox`}
                    checked={isRepeatIdentifierValue}
                    onChange={(val) =>
                      handleIsRepeatIdentifierChange(
                        val?.target?.checked,
                        `question-${qid}-is_repeat_identifier`
                      )
                    }
                  >
                    {" "}
                    Set this question as repeat group identifier/key
                  </Checkbox>
                </div>
              )
            }
          </>
        </TabPane>
        {/* Skip Logic */}
        <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical">
            <div className="field-help">
              This question will only be displayed if the following conditions
              apply
            </div>
            <div className="field-wrapper">
              <div className="field-label">Dependent to</div>
              <Space align="middle">
                <Form.Item name={`question-${qid}-skip_logic-dependent_to`}>
                  <Select
                    showSearch
                    className="bg-grey"
                    placeholder="Select question from list"
                    options={skipLogicQuestion}
                    style={{ width: "47.5vw" }}
                    filterOption={(input, option) =>
                      option.text.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onChange={handleChangeQuestionSkipLogicDependentTo}
                  />
                </Form.Item>
                <Tooltip title="Delete question skip logic">
                  <Button
                    type="text"
                    icon={<RiDeleteBinFill />}
                    onClick={handleOnDeleteSkipLogic}
                  />
                </Tooltip>
              </Space>
            </div>
            <Row align="middle" justify="space-between" gutter={[24, 24]}>
              <Col span={12}>
                {dependentQuestion && (
                  <>
                    <div className="field-wrapper">
                      <div className="field-label">Logic</div>
                      <Form.Item
                        name={`question-${qid}-skip_logic-operator`}
                        rules={[
                          { required: true, message: "Please select operator" },
                        ]}
                      >
                        <Select
                          allowClear
                          className="bg-grey"
                          placeholder="Select logic"
                          options={operators?.map((x) => {
                            return {
                              label: x,
                              value: x,
                            };
                          })}
                        />
                      </Form.Item>
                    </div>
                  </>
                )}
              </Col>
              <Col span={12}>
                {dependentQuestion?.type === "number" && (
                  <div className="field-wrapper">
                    <div className="field-label">Value</div>
                    <Form.Item
                      name={`question-${qid}-skip_logic-value-number`}
                      rules={[
                        { required: true, message: "Please input value" },
                      ]}
                    >
                      <InputNumber className="bg-grey" />
                    </Form.Item>
                  </div>
                )}
                {["option", "multiple_option"].includes(
                  dependentQuestion?.type
                ) && (
                  <div className="field-wrapper">
                    <div className="field-label">Value</div>
                    <Form.Item
                      name={`question-${qid}-skip_logic-value-option`}
                      rules={[
                        { required: true, message: "Please select value" },
                      ]}
                    >
                      <Select
                        allowClear
                        mode="multiple"
                        className="bg-grey"
                        placeholder="Select value"
                        options={dependentQuestion?.option?.map((x) => ({
                          label: x?.name,
                          value: x?.id,
                        }))}
                      />
                    </Form.Item>
                  </div>
                )}
              </Col>
            </Row>
          </Space>
        </TabPane>
        {/* Validation Criteria / Rule */}
        {question?.type === "number" && (
          <TabPane tab="Validation Criteria" key="validation-criteria">
            <Space direction="vertical" size="large">
              <div>
                This question will only be valid if the following conditions
                apply :
              </div>
              <div>
                <Form.Item
                  name={`question-${qid}-rule-allow_decimal`}
                  hidden
                  noStyle
                >
                  <Input />
                </Form.Item>
                <Space>
                  <Checkbox
                    checked={allowDecimal}
                    onChange={(val) =>
                      handleAllowDecimalChange(
                        val?.target?.checked,
                        `question-${qid}-rule-allow_decimal`
                      )
                    }
                  />{" "}
                  Allow Decimal
                </Space>
              </div>
              <div>
                <Space align="center" size="large">
                  <Form.Item
                    label="Min Value"
                    name={`question-${qid}-rule-min`}
                  >
                    <InputNumber className="bg-grey" />
                  </Form.Item>
                  <Form.Item
                    label="Max Value"
                    name={`question-${qid}-rule-max`}
                  >
                    <InputNumber className="bg-grey" />
                  </Form.Item>
                </Space>
              </div>
            </Space>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default QuestionSetting;
