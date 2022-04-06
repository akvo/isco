import React from "react";
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
} from "antd";
import { RiDeleteBinFill } from "react-icons/ri";
import { BiRadioCircle } from "react-icons/bi";
import { HiPlus, HiMinus, HiArrowSmUp, HiArrowSmDown } from "react-icons/hi";
import { store } from "../../lib";
import { orderBy, take } from "lodash";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID, insert } from "../../lib/util";
import { isoLangs } from "../../lib";

const { TabPane } = Tabs;

const RenderOptionInput = ({
  question,
  handlePlusMinusOptionButton,
  handleOrderingOption,
}) => {
  const qId = question?.id;
  const options = question?.option;

  const ButtonUp = ({ index, order }) => {
    if (!index) {
      return "";
    }
    return (
      <Button
        type="text"
        icon={<HiArrowSmUp />}
        onClick={() => handleOrderingOption(order, order - 1)}
      />
    );
  };

  const ButtonDown = ({ index, order }) => {
    if (index === options.length - 1) {
      return "";
    }
    return (
      <Button
        type="text"
        icon={<HiArrowSmDown />}
        onClick={() => handleOrderingOption(order, order + 1)}
      />
    );
  };

  return orderBy(options, ["order"])?.map((opt, optIndex) => (
    <Row key={`option-${opt?.id}`} justify="space-between" gutter={[12, 12]}>
      <Col span={19}>
        <Form.Item
          label={<BiRadioCircle />}
          name={`question-${qId}-option-${opt?.id}`}
          rules={[{ required: true, message: "Please input option value" }]}
        >
          <Input className="bg-grey" placeholder="Enter an answer option" />
        </Form.Item>
      </Col>
      <Col span={2} align="end">
        <Space size={1} align="center" className="float-right">
          <ButtonUp index={optIndex} order={opt.order} />
          <ButtonDown index={optIndex} order={opt.order} />
          <Button
            type="text"
            icon={<HiPlus />}
            onClick={() => handlePlusMinusOptionButton("add", opt, optIndex)}
          />
          <Button
            type="text"
            icon={<HiMinus />}
            onClick={() => handlePlusMinusOptionButton("remove", opt, optIndex)}
          />
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
                className="bg-grey"
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
              <Input placeholder="Value" className="bg-grey" />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={2}>
        <Space size={1} align="center">
          <Button
            type="text"
            icon={<HiPlus />}
            disabled={repeating_object_option?.length === 0}
            onClick={() => handlePlusMinusRepeatingObjects("add", ro, roi)}
          />
          <Button
            type="text"
            icon={<HiMinus />}
            onClick={() => handlePlusMinusRepeatingObjects("remove", ro, roi)}
          />
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
  const surveyEditor = store.useState((s) => s?.surveyEditor);
  const tempStorage = store.useState((s) => s?.tempStorage);
  const { cascade, nested } = store.useState((s) => s?.optionValues);
  const { type, option, repeating_objects } = question;
  const { questionGroup: questionGroupState } = surveyEditor;
  const qId = question?.id;

  const cascadeValues = type === "cascade" ? cascade : nested;

  const handleOrderingOption = (selectedOrder, targetOrder) => {
    const updatedQuestionGroup = questionGroupState.map((qg) => {
      const updatedQuestion = qg.question.map((q) => {
        let options = q.option;
        if (q.id === qId) {
          options = q.option.map((o) => {
            let newOrder = o.order;
            if (selectedOrder > targetOrder) {
              newOrder =
                o.order === selectedOrder
                  ? targetOrder
                  : o.order >= targetOrder && o.order < selectedOrder
                  ? o.order + 1
                  : o.order;
            }
            if (selectedOrder < targetOrder) {
              newOrder =
                o.order === selectedOrder
                  ? targetOrder
                  : o.order > selectedOrder && o.order <= targetOrder
                  ? o.order - 1
                  : o.order;
            }
            return {
              ...o,
              order: newOrder,
            };
          });
        }
        return {
          ...q,
          option: options,
        };
      });
      return {
        ...qg,
        question: updatedQuestion,
      };
    });
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: updatedQuestionGroup,
      };
    });
  };

  const handlePlusMinusOptionButton = (operation, opt, optIndex) => {
    const filterQuestionGroup = surveyEditor?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    let updatedOption = [];
    if (operation === "add") {
      updatedOption = insert(orderBy(option, ["order"]), optIndex + 1, {
        ...defaultOption,
        id: generateID(),
      })?.map((op, opi) => ({
        ...op,
        order: opi + 1,
      }));
    }

    if (operation === "remove") {
      updatedOption = question?.option?.filter((op) => op?.id !== opt?.id);
      // reordering option
      updatedOption = orderBy(updatedOption, ["order"]).map((o, oi) => ({
        ...o,
        order: oi + 1,
      }));
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

    // add new default option value if all deleted
    if (updatedOption.length === 0) {
      updatedOption = [
        {
          ...defaultOption,
          id: generateID(),
          order: 1,
        },
      ];
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
    const filterQuestionGroup = surveyEditor?.questionGroup?.filter(
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

    // add new default repeating objects if all deleted
    if (updatedRepeatingObject.length === 0) {
      updatedRepeatingObject = [
        { ...defaultRepeatingObject, id: generateID(), order: 1 },
      ];
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
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  return (
    <>
      {/* Cascade / Nested dropdown */}
      {(type === "cascade" || type === "nested_list") && (
        <div className="question-setting-wrapper">
          <div className="field-wrapper">
            <div className="field-label">Question Cascade</div>
            <Form.Item
              name={`question-${qId}-cascade`}
              rules={[{ required: true, message: "Please select cascade" }]}
            >
              <Select
                allowClear
                className="bg-grey"
                placeholder={`Select ${type?.split("_").join(" ")}`}
                options={cascadeValues?.map((x) => {
                  return {
                    label: x?.name,
                    value: x?.id,
                  };
                })}
              />
            </Form.Item>
          </div>
        </div>
      )}
      {/* Options */}
      {(type === "option" || type === "multiple_option") && (
        <>
          <div className="question-setting-wrapper">
            <div className="field-wrapper">
              <div className="field-label">Question Option</div>
              <RenderOptionInput
                question={question}
                handlePlusMinusOptionButton={handlePlusMinusOptionButton}
                handleOrderingOption={handleOrderingOption}
              />
            </div>
          </div>
          <div className="question-setting-wrapper">
            <Form.Item name={`question-${qId}-rule-allow_other`} hidden noStyle>
              <Input />
            </Form.Item>
            <Space>
              <Checkbox
                checked={allowOther}
                onChange={(val) =>
                  handleAllowOtherChange(
                    val?.target?.checked,
                    `question-${qId}-rule-allow_other`
                  )
                }
              />
              <span>Add an &quot;Other&quot; answer option</span>
            </Space>
          </div>
        </>
      )}
      {/* Repeating Objects */}
      <div className="question-setting-wrapper">
        <div className="field-wrapper">
          <div className="field-label">Extra Field</div>
          <RenderRepeatingObjectInput
            question={question}
            handlePlusMinusRepeatingObjects={handlePlusMinusRepeatingObjects}
          />
        </div>
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
            name={`${fieldNamePrefix}-tooltip_translations`}
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
  const { surveyEditor, tempStorage, optionValues } = store.useState((s) => s);
  const { questionGroup: questionGroupState } = surveyEditor;
  const { operator_type } = optionValues;
  const { id: qid } = question;
  const skipLogicQuestionType = ["option", "number", "multiple_option"];

  const allQuestion = orderBy(
    questionGroupState?.flatMap((qg) => qg?.question),
    ["order"]
  );
  // take skip logic question by question current order
  const skipLogicQuestion = take(allQuestion, question?.order)
    ?.filter((q) => skipLogicQuestionType.includes(q?.type) && q?.id !== qid)
    ?.map((q) => ({
      label: q?.name,
      value: q?.id,
    }));

  const dependentId = parseInt(
    form?.getFieldValue(`question-${qid}-skip_logic-dependent_to`)
  );
  const dependentQuestion = allQuestion?.find((q) => q?.id === dependentId);
  const operators = dependentQuestion?.type.includes("option")
    ? operator_type?.filter((x) => x === "equal")
    : operator_type;

  const handleRequiredChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setMandatory(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handlePersonalDataChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setPersonalData(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleAllowDecimalChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowDecimal(val);
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

  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
        {/* Question Options */}
        <TabPane tab="Settings" key="question-option">
          <>
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
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
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
                      name={`question-${qid}-skip_logic-value`}
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
                      name={`question-${qid}-skip_logic-value`}
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

const QuestionSetting = ({
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

export default QuestionSetting;
