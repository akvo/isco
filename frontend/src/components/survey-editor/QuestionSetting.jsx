import React, { useEffect } from "react";
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

  return option?.map((opt, optIndex) => (
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
  repeating_objects,
  handlePlusMinusRepeatingObjects,
}) => {
  repeating_objects =
    repeating_objects?.length || repeating_objects
      ? repeating_objects
      : [defaultRepeatingObject];

  return repeating_objects?.map((ro, roi) => (
    <Row
      key={`repeating-object-${ro?.id}`}
      align="middle"
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={22}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item name={`question-repeating-object-field-${ro?.id}`}>
              <Input placeholder="Field" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={`question-repeating-object-value-${ro?.id}`}>
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

const Detail = ({ form, questionGroup, question }) => {
  const state = store.useState((s) => s?.surveyEditor);
  const { type, option, repeating_objects } = question;

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
    }

    const questionGroupWithUpdatedQuestionOption = {
      ...questionGroup,
      question: orderBy(
        [
          ...filterQuestion,
          {
            ...question,
            option: updatedOption,
          },
        ],
        ["order"]
      ),
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy(
          [...filterQuestionGroup, questionGroupWithUpdatedQuestionOption],
          ["order"]
        ),
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
      question: orderBy(
        [
          ...filterQuestion,
          {
            ...question,
            repeating_objects: updatedRepeatingObject,
          },
        ],
        ["order"]
      ),
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy(
          [...filterQuestionGroup, questionGroupWithUpdatedQuestionOption],
          ["order"]
        ),
      };
    });
  };

  return (
    <>
      {/* Options */}
      {type === "option" && (
        <div className="question-setting-wrapper">
          <RenderOptionInput
            question={question}
            option={option}
            handlePlusMinusOptionButton={handlePlusMinusOptionButton}
          />
        </div>
      )}
      {/* Repeating Objects */}
      <div className="question-setting-wrapper">
        <RenderRepeatingObjectInput
          repeating_objects={repeating_objects}
          handlePlusMinusRepeatingObjects={handlePlusMinusRepeatingObjects}
        />
      </div>
      {/* Add Other */}
      <div className="question-setting-wrapper">
        <Row>
          <Col span={1}>
            <Form.Item name="rule-other">
              <Checkbox checked={false} />
            </Form.Item>
          </Col>
          <Col span={23}>
            <Input
              placeholder='Add an "Other" answer option or Comment Field'
              disabled
            />
          </Col>
        </Row>
        <Row>
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
        </Row>
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

const Setting = ({ question, questionGroup }) => {
  const qid = question?.id;

  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
        <TabPane tab="Question Options" key="question-option">
          <>
            <Form.Item name={`question-variable_name-${qid}`}>
              <Input
                className="bg-grey"
                placeholder="Data Column Name (Custom ID)"
              />
            </Form.Item>
            <Form.Item name={`question-tooltip-${qid}`}>
              <Input placeholder="Tooltip" />
            </Form.Item>
            <Space size={100}>
              <Form.Item name={`question-mandatory-${qid}`}>
                <Space>
                  Required <Switch size="small" />
                </Space>
              </Form.Item>
              <Form.Item name={`question-personal_data-${qid}`}>
                <Space>
                  Personal data <Switch size="small" />
                </Space>
              </Form.Item>
            </Space>
          </>
        </TabPane>
        <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Form.Item name={`question-skip_logic-${qid}`}>
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
            <Form.Item label="This question's response has to be" name="rule">
              <Input className="bg-grey" placeholder="Response Value" />
            </Form.Item>
            <hr />
            <Form.Item name="error_message">
              <Input className="bg-grey" placeholder="Error Message" />
            </Form.Item>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

const RenderLayout = ({ form, activeSetting, questionGroup, question }) => {
  switch (activeSetting) {
    case "translation":
      return <Translation questionGroup={questionGroup} question={question} />;
    case "setting":
      return <Setting questionGroup={questionGroup} question={question} />;
    default:
      return (
        <Detail form={form} questionGroup={questionGroup} question={question} />
      );
  }
};

const QuestionSetting = ({ form, activeSetting, questionGroup, question }) => {
  return (
    <>
      <RenderLayout
        form={form}
        activeSetting={activeSetting}
        questionGroup={questionGroup}
        question={question}
      />
      <div className="question-button-wrapper">
        <Space align="center">
          <Button>Cancel</Button>
          <Button type="primary" ghost>
            Save
          </Button>
        </Space>
      </div>
    </>
  );
};

export default QuestionSetting;
