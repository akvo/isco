import React, { useMemo } from "react";
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
} from "antd";
import { RiDeleteBinFill } from "react-icons/ri";
import { BiRadioCircle } from "react-icons/bi";
import { HiPlus, HiMinus } from "react-icons/hi";
import { store } from "../../lib";
import orderBy from "lodash/orderBy";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID, insert } from "../../lib/util";
import { isoLangs } from "../../lib";

const { TabPane } = Tabs;

const RenderOptionInput = ({ question, handlePlusMinusOptionButton }) => {
  const qId = question?.id;
  const option = question?.option;

  return orderBy(option, ["order"])?.map((opt, optIndex) => (
    <Row
      key={`option-${opt?.id}`}
      align="middle"
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={22}>
        <Form.Item
          label={<BiRadioCircle />}
          name={`question-${qId}-option-${opt?.id}`}
          rules={[{ required: true, message: "Please option value" }]}
        >
          <Input placeholder="Enter an answer choice" />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Space size={1} align="center">
          <Button
            type="text"
            icon={<HiPlus />}
            onClick={() => handlePlusMinusOptionButton("add", opt, optIndex)}
          />
          {option.length > 1 && (
            <Button
              type="text"
              icon={<HiMinus />}
              onClick={() =>
                handlePlusMinusOptionButton("remove", opt, optIndex)
              }
            />
          )}
        </Space>
      </Col>
    </Row>
  ));
};

const RenderRepeatingObjectInput = ({
  question,
  handlePlusMinusRepeatingObjects,
}) => {
  const qId = question?.id;
  const repeating_objects = question?.repeating_objects;
  let repeating_object_option = store.useState(
    (s) => s?.optionValues?.repeating_object_option
  );

  // filter repeating object option by repeting object filled
  repeating_object_option = repeating_object_option?.filter(
    (x) => !repeating_objects?.map((y) => y?.field).includes(x)
  );

  return repeating_objects?.map((ro, roi) => (
    <Row
      key={`repeating-object-${ro?.id || roi}`}
      align="middle"
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={22}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name={`question-${qId}-repeating_objects_field-${ro?.id || roi}`}
            >
              <Select
                allowClear
                placeholder="Select field value"
                options={repeating_object_option?.map((x) => ({
                  label: x,
                  value: x,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={`question-${qId}-repeating_objects_value-${ro?.id || roi}`}
            >
              <Input placeholder="Value" />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={2}>
        <Space size={1} align="middle">
          <Button
            type="text"
            icon={<HiPlus />}
            disabled={repeating_object_option?.length === 0}
            onClick={() => handlePlusMinusRepeatingObjects("add", ro, roi)}
          />
          {repeating_objects.length > 1 && (
            <Button
              type="text"
              icon={<HiMinus />}
              onClick={() => handlePlusMinusRepeatingObjects("remove", ro, roi)}
            />
          )}
        </Space>
      </Col>
    </Row>
  ));
};

const Detail = ({
  form,
  questionGroup,
  question,
  handleFormOnValuesChange,
  setAllowOther,
  allowOther,
}) => {
  const state = store.useState((s) => s?.surveyEditor);
  const tempStorage = store.useState((s) => s?.tempStorage);
  const { cascade, nested } = store.useState((s) => s?.optionValues);
  const { type, option, repeating_objects } = question;
  const qId = question?.id;

  const cascadeValues = type === "cascade" ? cascade : nested;

  const handlePlusMinusOptionButton = (operation, opt, optIndex) => {
    const filterQuestionGroup = state?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    let updatedOption = [];
    if (operation === "add") {
      updatedOption = insert(option, optIndex + 1, {
        ...defaultOption,
        id: generateID(),
      })?.map((op, opi) => ({
        ...op,
        order: opi + 1,
      }));
    }

    if (operation === "remove") {
      updatedOption = question?.option?.filter((op) => op?.id !== opt?.id);
      // store removed option to delete when save button clicked
      const storage = tempStorage;
      const filterTempStorage = storage.deletedOptions?.filter(
        (x) => x?.id !== opt?.id
      );
      store.update((s) => {
        s.tempStorage = {
          ...storage,
          deletedOptions: [...filterTempStorage, opt],
        };
      });
    }

    const questionGroupWithUpdatedQuestionOption = {
      ...questionGroup,
      question: [
        ...filterQuestion,
        {
          ...question,
          option: updatedOption,
        },
      ],
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: [
          ...filterQuestionGroup,
          questionGroupWithUpdatedQuestionOption,
        ],
      };
    });
  };

  const handlePlusMinusRepeatingObjects = (operation, ro, roi) => {
    const filterQuestionGroup = state?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    let updatedRepeatingObject = [];
    if (operation === "add") {
      updatedRepeatingObject = insert(repeating_objects, roi + 1, {
        ...defaultRepeatingObject,
        id: generateID(),
      })?.map((r, ri) => ({
        ...r,
        order: ri + 1,
      }));
    }

    if (operation === "remove") {
      updatedRepeatingObject = question?.repeating_objects?.filter(
        (op) => op?.id !== ro?.id || op?.field !== ro?.field
      );
    }

    const questionGroupWithUpdatedRepeatingObject = {
      ...questionGroup,
      question: [
        ...filterQuestion,
        {
          ...question,
          repeating_objects: updatedRepeatingObject,
        },
      ],
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: [
          ...filterQuestionGroup,
          questionGroupWithUpdatedRepeatingObject,
        ],
      };
    });
  };

  const handleAllowOtherChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowOther(val);
    setTimeout(() => {
      handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
    }, 100);
  };

  return (
    <>
      {/* Cascade / Nested dropdown */}
      {(type === "cascade" || type === "nested_list") && (
        <div className="question-setting-wrapper">
          <Form.Item
            name={`question-${qId}-cascade`}
            rules={[{ required: true, message: "Please select cascade name" }]}
          >
            <Select
              allowClear
              className="bg-grey"
              placeholder={`Select ${type?.split("_").join(" ")} value`}
              options={cascadeValues?.map((x) => {
                return {
                  label: x?.name,
                  value: x?.id,
                };
              })}
            />
          </Form.Item>
        </div>
      )}
      {/* Options */}
      {(type === "option" || type === "multiple_option") && (
        <>
          <div className="question-setting-wrapper">
            <RenderOptionInput
              question={question}
              handlePlusMinusOptionButton={handlePlusMinusOptionButton}
            />
          </div>
          <div className="question-setting-wrapper">
            <Row align="middle" justify="space-between">
              <Col span={1}>
                <Form.Item
                  name={`question-${qId}-rule-allow_other`}
                  hidden
                  noStyle
                >
                  <Input />
                </Form.Item>
                <Checkbox
                  checked={allowOther}
                  onChange={(val) =>
                    handleAllowOtherChange(
                      val?.target?.checked,
                      `question-${qId}-rule-allow_other`
                    )
                  }
                />
              </Col>
              <Col span={23}>
                <Input
                  placeholder='Add an "Other" answer option or Comment Field'
                  disabled
                />
              </Col>
            </Row>
            {/* <Row>
          <Col span={1}>
            <Form.Item name="rule-none">
              <Checkbox checked={false} />
            </Form.Item>
          </Col>
          <Col span={23}>
            <Input
              placeholder='Add a "None of the above" answer option'
              disabled
            />
          </Col>
        </Row> */}
          </div>
        </>
      )}
      {/* Repeating Objects */}
      <div className="question-setting-wrapper">
        <RenderRepeatingObjectInput
          question={question}
          handlePlusMinusRepeatingObjects={handlePlusMinusRepeatingObjects}
        />
      </div>
    </>
  );
};

const Translation = ({ question, activeLang }) => {
  const { id, name, tooltip } = question;
  const lang = isoLangs?.[activeLang];
  const fieldNamePrefix = `question-${id}-translations-${activeLang}`;
  const placeholder = `Enter ${lang?.name} translation`;

  // filter option from the default option list
  const option = question?.option?.filter((x) => x?.name);

  return (
    <>
      <div className="question-setting-wrapper">
        <Form.Item
          label={<div className="translation-label">{name}</div>}
          name={`${fieldNamePrefix}-name`}
        >
          <Input className="bg-grey" placeholder={placeholder} />
        </Form.Item>
      </div>
      {tooltip && (
        <div className="question-setting-wrapper">
          <Form.Item
            label={<div className="translation-label">{tooltip}</div>}
            name={`${fieldNamePrefix}-tooltip`}
          >
            <Input className="bg-grey" placeholder={placeholder} />
          </Form.Item>
        </div>
      )}
      {option?.length > 0 && (
        <div className="question-setting-wrapper">
          {option?.map(({ id, name }) => (
            <Form.Item
              key={`option-translation-${id}`}
              label={<div className="translation-label">{name}</div>}
              name={`${fieldNamePrefix}-option_name-${id}`}
            >
              <Input className="bg-grey" placeholder={placeholder} />
            </Form.Item>
          ))}
        </div>
      )}
    </>
  );
};

const Setting = ({
  form,
  question,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  handleFormOnValuesChange,
  allowDecimal,
  setAllowDecimal,
}) => {
  const state = store?.useState((s) => s?.surveyEditor);
  const tempStorage = store?.useState((s) => s?.tempStorage);
  const optionValues = store?.useState((s) => s?.optionValues);
  const { operator_type } = optionValues;
  const qid = question?.id;
  const { type } = question;
  const allQuestion = state?.questionGroup?.flatMap((qg) => qg?.question);
  const skipLogicQuestion = allQuestion
    ?.filter((q) => ["option", "number"].includes(q?.type))
    ?.map((q) => ({
      label: q?.name,
      value: String(q?.id),
    }));

  const dependentId = parseInt(
    form?.getFieldValue(`question-${qid}-skip_logic-dependent_to`)
  );
  const dependentQuestion = useMemo(() => {
    const find = allQuestion?.find((q) => q?.id === dependentId);
    if (find) {
      // set skip logic type
      const type = { [`question-${qid}-skip_logic-type`]: find?.type };
      form.setFieldsValue(type);
      setTimeout(() => {
        handleFormOnValuesChange(type, form?.getFieldsValue());
      }, 100);
    }
    return find;
  }, [dependentId, allQuestion, form, handleFormOnValuesChange, qid]);

  const operators = dependentQuestion?.type.includes("option")
    ? operator_type?.filter((x) => x === "equal")
    : operator_type;

  const handleRequiredChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setMandatory(val);
    setTimeout(() => {
      handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
    }, 100);
  };

  const handlePersonalDataChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setPersonalData(val);
    setTimeout(() => {
      handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
    }, 100);
  };

  const handleAllowDecimalChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowDecimal(val);
    setTimeout(() => {
      handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
    }, 100);
  };

  const handleOnDeleteSkipLogic = () => {
    const skipLogic = question?.skip_logic?.[0];
    const fieldValue = {
      [`question-${qid}-skip_logic-dependent_to`]: "",
    };
    form.setFieldsValue(fieldValue);
    setTimeout(() => {
      handleFormOnValuesChange(
        { [`question-${qid}-skip_logic`]: null },
        form?.getFieldsValue()
      );
    }, 100);
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

  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
        {/* Question Options */}
        <TabPane tab="Question Options" key="question-option">
          <>
            <Form.Item name={`question-${qid}-variable_name`}>
              <Input
                className="bg-grey"
                placeholder="Data Column Name (Custom ID)"
              />
            </Form.Item>
            <Form.Item name={`question-${qid}-tooltip`}>
              <Input placeholder="Tooltip" />
            </Form.Item>
            <Space size={100}>
              <div>
                <Form.Item name={`question-${qid}-mandatory`} hidden noStyle>
                  <Input />
                </Form.Item>
                Required{" "}
                <Switch
                  key={`question-${qid}-mandatory-switch`}
                  size="small"
                  checked={mandatory}
                  onChange={(val) =>
                    handleRequiredChange(val, `question-${qid}-mandatory`)
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
          </>
        </TabPane>
        {/* Skip Logic */}
        <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Space align="middle">
              <Form.Item name={`question-${qid}-skip_logic-dependent_to`}>
                <Select
                  className="bg-grey"
                  placeholder="Select question from list"
                  options={skipLogicQuestion}
                  style={{ width: "47.5vw" }}
                />
              </Form.Item>
              <Button
                type="text"
                icon={<RiDeleteBinFill />}
                onClick={handleOnDeleteSkipLogic}
              />
            </Space>
            <Row align="middle" justify="space-between" gutter={[24, 24]}>
              <Col span={12}>
                {dependentQuestion && (
                  <>
                    <Form.Item
                      name={`question-${qid}-skip_logic-type`}
                      hidden
                      noStyle
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={`question-${qid}-skip_logic-operator`}
                      rules={[
                        { required: true, message: "Please select operator" },
                      ]}
                    >
                      <Select
                        allowClear
                        className="bg-grey"
                        placeholder="Select operator"
                        options={operators?.map((x) => {
                          return {
                            label: x,
                            value: x,
                          };
                        })}
                      />
                    </Form.Item>
                  </>
                )}
              </Col>
              <Col span={12}>
                {dependentQuestion?.type === "number" && (
                  <Form.Item
                    name={`question-${qid}-skip_logic-value`}
                    rules={[{ required: true, message: "Please input value" }]}
                  >
                    <InputNumber className="bg-grey" />
                  </Form.Item>
                )}
                {dependentQuestion?.type === "option" && (
                  <Form.Item
                    name={`question-${qid}-skip_logic-value`}
                    rules={[{ required: true, message: "Please select value" }]}
                  >
                    <Select
                      allowClear
                      mode="multiple"
                      className="bg-grey"
                      placeholder="Select value"
                      options={dependentQuestion?.option?.map((x) => ({
                        label: x?.name,
                        value: String(x?.id),
                      }))}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Space>
        </TabPane>
        {/* Validation Criteria / Rule */}
        {type === "number" && (
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

const RenderLayout = ({
  form,
  activeSetting,
  questionGroup,
  question,
  handleFormOnValuesChange,
  setAllowOther,
  allowOther,
  allowDecimal,
  setAllowDecimal,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  activeLang,
  setActiveLang,
}) => {
  switch (activeSetting) {
    case "translation":
      return (
        <Translation
          questionGroup={questionGroup}
          question={question}
          activeLang={activeLang}
          setActiveLang={setActiveLang}
        />
      );
    case "setting":
      return (
        <Setting
          form={form}
          questionGroup={questionGroup}
          question={question}
          mandatory={mandatory}
          setMandatory={setMandatory}
          allowDecimal={allowDecimal}
          setAllowDecimal={setAllowDecimal}
          personalData={personalData}
          setPersonalData={setPersonalData}
          handleFormOnValuesChange={handleFormOnValuesChange}
        />
      );
    default:
      return (
        <Detail
          form={form}
          questionGroup={questionGroup}
          question={question}
          handleFormOnValuesChange={handleFormOnValuesChange}
          allowOther={allowOther}
          setAllowOther={setAllowOther}
        />
      );
  }
};

const QuestionSetting = ({
  form,
  activeSetting,
  questionGroup,
  question,
  handleFormOnValuesChange,
  submitStatus,
  setSubmitStatus,
  setAllowOther,
  allowOther,
  allowDecimal,
  setAllowDecimal,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  setActivePanel,
  activeLang,
  setActiveLang,
}) => {
  return (
    <>
      <RenderLayout
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
      />
      <div className="question-button-wrapper">
        <Space align="center">
          <Button onClick={() => setActivePanel(null)}>Cancel</Button>
          <Button
            type="primary"
            ghost
            loading={submitStatus === `question-${question?.id}`}
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
    </>
  );
};

export default QuestionSetting;
