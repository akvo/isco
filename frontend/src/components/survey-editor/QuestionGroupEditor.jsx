import React, { useState } from "react";
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
} from "antd";
import { RiSettings5Fill, RiDeleteBinFill } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";
import { AiOutlineGroup } from "react-icons/ai";
import QuestionEditor from "./QuestionEditor";
import { store } from "../../lib";
import {
  defaultQuestionEditor,
  defaultQuestionGroupEditor,
} from "../../lib/store";
import { findLast, orderBy } from "lodash";
import { generateID } from "../../lib/util";

const { TabPane } = Tabs;

const QuestionGroupSetting = ({ index, questionGroup }) => {
  const optionValues = store.useState((s) => s?.optionValues);
  const { member_type, isco_type } = optionValues;
  const qgid = questionGroup?.id;
  console.log(member_type, isco_type);

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
              <Form.Item name={`question_group-description-${qgid}`}>
                <Input.TextArea
                  rows={3}
                  placeholder="Question Group Description"
                />
              </Form.Item>
              <Form.Item name={`question_group-mandatory-${qgid}`}>
                <Space>
                  Required <Switch size="small" />
                </Space>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name={`question_group-member-type-${qgid}`}>
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
              <Form.Item name={`question_group-isco-type-${qgid}`}>
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
        <TabPane tab="Skip Logic" key="skip-logic">
          <Space direction="vertical" className="qge-setting-tab-body">
            <div>
              This question will only be displayed if the following conditions
              apply
            </div>
            <Form.Item name={`question_group-skip_logic-${qgid}`}>
              <Select placeholder="Select question from list" options={[]} />
            </Form.Item>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

const QuestionGroupEditor = ({ form, index, questionGroup }) => {
  const [isGroupSettingVisible, setIsGroupSettingVisible] = useState(false);
  const state = store.useState((s) => s?.surveyEditor);
  const { id, question } = questionGroup;

  const handleAddQuestionButton = (questionGroup) => {
    const findQuestionGroup = state.questionGroup.find(
      (qg) => qg?.id === questionGroup?.id
    );
    const filterQuestionGroup = state.questionGroup.filter(
      (qg) => qg?.id !== questionGroup?.id
    );
    const lastQ = findLast(questionGroup.question, "id");
    const newQg = {
      ...findQuestionGroup,
      question: [
        ...findQuestionGroup?.question,
        {
          ...defaultQuestionEditor,
          id: generateID(),
          order: lastQ?.order + 1,
        },
      ],
    };
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy([...filterQuestionGroup, newQg], ["order"]),
      };
    });
  };

  const handleAddQuestionGroupButton = (questionGroup) => {
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy(
          [
            ...s.surveyEditor.questionGroup,
            {
              ...defaultQuestionGroupEditor,
              id: generateID(),
              order: questionGroup?.order + 1,
              question: [
                {
                  ...defaultQuestionGroupEditor?.question?.[0],
                  id: generateID(),
                },
              ],
            },
          ],
          ["order"]
        ),
      };
    });
  };

  const handleDeleteQuestionGroupButton = (questionGroup) => {
    const filterQuestionGroup = state.questionGroup.filter(
      (qg) => qg?.id !== questionGroup?.id
    );
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: orderBy(filterQuestionGroup, ["order"]),
      };
    });
  };

  return (
    <Row
      key={`qge-${id}`}
      className="question-group-editor-wrapper"
      align="bottom"
      justify="space-between"
      gutter={[40, 12]}
    >
      <Col span={22}>
        <Card className="qge-card-wrapper">
          <Row
            className="section-title-row"
            align="middle"
            justify="space-between"
          >
            <Col span={18} align="start" className="left">
              <Form.Item name={`question_group-name-${id}`}>
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
                  onClick={() => handleDeleteQuestionGroupButton(questionGroup)}
                />
              </Space>
            </Col>
          </Row>
          {isGroupSettingVisible ? (
            <QuestionGroupSetting index={index} questionGroup={questionGroup} />
          ) : (
            question.map((q, qi) => (
              <QuestionEditor
                key={`question-key-${qi + 1}`}
                form={form}
                index={qi + 1}
                question={q}
                questionGroup={questionGroup}
              />
            ))
          )}
        </Card>
      </Col>
      <Col span={2} align="center">
        <Card className="button-control-wrapper">
          <Space align="center" direction="vertical">
            <Button
              ghost
              icon={<HiPlus />}
              onClick={() => handleAddQuestionButton(questionGroup)}
            />
            <Button
              ghost
              icon={<AiOutlineGroup />}
              onClick={() => handleAddQuestionGroupButton(questionGroup)}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionGroupEditor;
