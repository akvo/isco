import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Checkbox,
  Button,
  Space,
  Tabs,
  Switch,
  Select,
} from "antd";
import { BiRadioCircle } from "react-icons/bi";
import { HiPlus, HiMinus } from "react-icons/hi";
import { store } from "../../lib";
import orderBy from "lodash/orderBy";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID, insert } from "../../lib/util";

const { TabPane } = Tabs;

const RenderOptionInput = ({
  question,
  option,
  handlePlusMinusOptionButton,
}) => {
  const qId = question?.id;

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
  repeating_objects,
  handlePlusMinusRepeatingObjects,
}) => {
  const qId = question?.id;

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
              <Input placeholder="Field" />
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
        <Space size={1} align="center">
          <Button
            type="text"
            icon={<HiPlus />}
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
  const { type, option, repeating_objects } = question;
  const qId = question?.id;

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
      store.update((s) => {
        s.tempStorage = {
          ...s.tempStorage,
          deletedOptions: [
            ...s.tempStorage.deletedOptions?.filter((x) => x?.id !== opt?.id),
            opt,
          ],
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
        (op) => op?.id !== ro?.id
      );
    }

    const questionGroupWithUpdatedQuestionOption = {
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
          questionGroupWithUpdatedQuestionOption,
        ],
      };
    });
  };

  const handleAllowOtherChange = (val, field) => {
    form.setFieldsValue({ [field]: val });
    setAllowOther(val);
    setTimeout(() => {
      handleFormOnValuesChange(form?.getFieldsValue(), form?.getFieldsValue());
    }, 100);
  };

  return (
    <>
      {/* Options */}
      {(type === "option" || type === "multiple_option") && (
        <>
          <div className="question-setting-wrapper">
            <RenderOptionInput
              question={question}
              option={option}
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
          repeating_objects={repeating_objects}
          handlePlusMinusRepeatingObjects={handlePlusMinusRepeatingObjects}
        />
      </div>
    </>
  );
};

const Translation = () => {
  return (
    <>
      <div className="question-setting-wrapper ">
        <Form.Item
          label={<div className="translation-label">Question 1</div>}
          name="name-here"
        >
          <Input className="bg-grey" placeholder="Enter translation" />
        </Form.Item>
      </div>
      <div className="question-setting-wrapper">
        <Form.Item
          label={<div className="translation-label">Question Tooltip</div>}
          name="name-here"
        >
          <Input className="bg-grey" placeholder="Enter translation" />
        </Form.Item>
      </div>
      <div className="question-setting-wrapper">
        <Form.Item
          label={<div className="translation-label">Option 1</div>}
          name="name-here"
        >
          <Input className="bg-grey" placeholder="Enter translation" />
        </Form.Item>
        <Form.Item
          label={<div className="translation-label">Option 2</div>}
          name="name-here"
        >
          <Input className="bg-grey" placeholder="Enter translation" />
        </Form.Item>
      </div>
    </>
  );
};

const Setting = ({
  form,
  question,
  questionGroup,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  handleFormOnValuesChange,
}) => {
  const qid = question?.id;

  const handleRequiredChange = (val, field) => {
    form.setFieldsValue({ [field]: val });
    setMandatory(val);
    setTimeout(() => {
      handleFormOnValuesChange(form?.getFieldsValue(), form?.getFieldsValue());
    }, 100);
  };

  const handlePersonalDataChange = (val, field) => {
    form.setFieldsValue({ [field]: val });
    setPersonalData(val);
    setTimeout(() => {
      handleFormOnValuesChange(form?.getFieldsValue(), form?.getFieldsValue());
    }, 100);
  };

  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
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
        <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Form.Item name={`question-${qid}-skip_logic`}>
              <Select
                className="bg-grey"
                placeholder="Select question from list"
                options={[]}
              />
            </Form.Item>
          </Space>
        </TabPane>
        <TabPane tab="Validation Criteria" key="validation-criteria">
          <Space direction="vertical">
            <div>
              This question will only be valid if the following conditions apply
            </div>
            <Form.Item
              label="This question's response has to be"
              name={`question-${qid}-rule`}
            >
              <Input className="bg-grey" placeholder="Response Value" />
            </Form.Item>
            <hr />
            <Form.Item name={`question-${qid}-error_message`}>
              <Input className="bg-grey" placeholder="Error Message" />
            </Form.Item>
          </Space>
        </TabPane>
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
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
}) => {
  switch (activeSetting) {
    case "translation":
      return <Translation questionGroup={questionGroup} question={question} />;
    case "setting":
      return (
        <Setting
          form={form}
          questionGroup={questionGroup}
          question={question}
          mandatory={mandatory}
          setMandatory={setMandatory}
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
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
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
        mandatory={mandatory}
        setMandatory={setMandatory}
        personalData={personalData}
        setPersonalData={setPersonalData}
      />
      <div className="question-button-wrapper">
        <Space align="center">
          <Button>Cancel</Button>
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
