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
import { defaultOption } from "../../lib/store";
import { v4 as uuidv4 } from "uuid";

const { TabPane } = Tabs;

const Detail = ({ questionGroup, question }) => {
  const state = store.useState((s) => s?.surveyEditor);
  const { type, option } = question;

  const handlePlusMinusOptionButton = (operation, opt, optIndex) => {
    const filterQuestionGroup = state?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    const insert = (arr, index, ...newItems) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted items
      ...newItems,
      // part of the array after the specified index
      ...arr.slice(index),
    ];

    let updatedOption = [];
    if (operation === "add") {
      updatedOption = insert(option, optIndex + 1, {
        ...defaultOption,
        id: uuidv4(),
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

  return (
    <>
      {/* Options */}
      <div className="question-setting-wrapper">
        {option?.map((opt, optIndex) => (
          <Row
            key={`option-${opt?.id}`}
            align="middle"
            justify="space-between"
            gutter={[12, 12]}
          >
            <Col span={22}>
              <Form.Item
                label={<BiRadioCircle />}
                name={`question-option-${opt?.id}`}
              >
                <Input placeholder="Enter an answer choice" />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Space size={1} align="center">
                <Button
                  type="text"
                  icon={<HiPlus />}
                  onClick={() =>
                    handlePlusMinusOptionButton("add", opt, optIndex)
                  }
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
        ))}
      </div>
      {/* Repeat Objects */}
      <div className="question-setting-wrapper">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item name="repeat-object-key">
              <Input placeholder="Field" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="repeat-object-value">
              <Input placeholder="Value" />
            </Form.Item>
          </Col>
        </Row>
      </div>
      {/* Add Other */}
      {/* <div className="question-setting-wrapper">
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
      </div> */}
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

const Setting = () => {
  return (
    <div className="question-setting-wrapper setting">
      <Tabs size="small">
        <TabPane tab="Question Options" key="question-option">
          <>
            <Form.Item name="variable_name">
              <Input
                className="bg-grey"
                placeholder="Data Column Name (Custom ID)"
              />
            </Form.Item>
            <Form.Item name="tooltip">
              <Input placeholder="Tooltip" />
            </Form.Item>
            <Space size={100}>
              <Form.Item name="mandatory">
                <Space>
                  Required <Switch size="small" />
                </Space>
              </Form.Item>
              <Form.Item name="personal_data">
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
            <Form.Item name="skip_logic">
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

const RenderLayout = ({ activeSetting, questionGroup, question }) => {
  switch (activeSetting) {
    case "translation":
      return <Translation />;
    case "setting":
      return <Setting />;
    default:
      return <Detail questionGroup={questionGroup} question={question} />;
  }
};

const QuestionSetting = ({ activeSetting, questionGroup, question }) => {
  return (
    <>
      <RenderLayout
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
