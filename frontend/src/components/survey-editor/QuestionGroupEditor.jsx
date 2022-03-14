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
import { MdTextFields } from "react-icons/md";
import { AiOutlineGroup } from "react-icons/ai";
import QuestionEditor from "./QuestionEditor";

const { TabPane } = Tabs;

const QuestionGroupSetting = () => {
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
            <Col span={8}>
              <Form.Item name="variable_name">
                <Input placeholder="Data Column Name (Custom ID)" />
              </Form.Item>
              <Form.Item name="mandatory">
                <Space>
                  Required <Switch size="small" />
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="member_type">
                <Select
                  className="custom-dropdown-wrapper"
                  placeholder="Member Type"
                  options={[]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isco_type">
                <Select
                  className="custom-dropdown-wrapper"
                  placeholder="Organization"
                  options={[]}
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
            <Form.Item name="skip_logic">
              <Select placeholder="Select question from list" options={[]} />
            </Form.Item>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

const QuestionGroupEditor = ({ form }) => {
  const [isGroupSettingVisible, setIsGroupSettingVisible] = useState(false);

  return (
    <Row
      className="question-group-editor-wrapper"
      align="bottom"
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={21}>
        <Card className="qge-card-wrapper">
          <Row
            className="section-title-row"
            align="middle"
            justify="space-between"
          >
            <Col span={18} align="start" className="left">
              <Form.Item name="question-group-name">
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
                <Button type="text" icon={<RiDeleteBinFill />} />
              </Space>
            </Col>
          </Row>
          {isGroupSettingVisible ? (
            <QuestionGroupSetting />
          ) : (
            <QuestionEditor form={form} />
          )}
        </Card>
      </Col>
      <Col span={3} align="center">
        <Card className="button-control-wrapper">
          <Space align="center">
            <Button ghost icon={<HiPlus />} />
            <Button ghost icon={<MdTextFields />} />
            <Button ghost icon={<AiOutlineGroup />} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionGroupEditor;
