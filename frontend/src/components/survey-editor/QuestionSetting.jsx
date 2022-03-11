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

const { TabPane } = Tabs;

const Detail = () => {
  return (
    <>
      <div className="question-setting-wrapper">
        <Form.Item label={<BiRadioCircle />} name="option">
          <Input placeholder="Enter an answer choice" />
        </Form.Item>
        <Form.Item label={<BiRadioCircle />} name="option">
          <Input placeholder="Enter an answer choice" />
        </Form.Item>
      </div>
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
      <div className="question-setting-wrapper">
        <Row>
          <Col span={1}>
            <Form.Item name="rule-other">
              <Checkbox />
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
              <Checkbox />
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

const RenderLayout = ({ activeSetting }) => {
  switch (activeSetting) {
    case "translation":
      return <Translation />;
    case "setting":
      return <Setting />;
    default:
      return <Detail />;
  }
};

const QuestionSetting = ({ activeSetting }) => {
  return (
    <>
      <RenderLayout activeSetting={activeSetting} />
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
