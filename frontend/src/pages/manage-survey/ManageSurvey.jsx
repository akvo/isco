import React, { useState, useEffect } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Tooltip,
  Space,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";
import { MdFileCopy } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { dataSources } from "./static";
import { store, api } from "../../lib";

const { Title } = Typography;

const columns = [
  {
    title: "",
    dataIndex: "",
    key: "status",
    render: (record) => {
      if (!record?.status) {
        return "";
      }
      return (
        <Tooltip
          key={`${record?.id}-${record?.key}`}
          title={record?.status}
          placement="left"
        >
          <FaInfoCircle />
        </Tooltip>
      );
    },
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    className: "bg-grey title",
  },
  {
    title: "Added By",
    dataIndex: "user",
    key: "user",
    className: "bg-grey",
  },
  {
    title: "Date Created",
    dataIndex: "created",
    key: "created",
    className: "bg-grey",
  },
  {
    title: "Action",
    dataIndex: "",
    key: "action",
    className: "bg-grey",
    render: (record) => {
      return (
        <Space key={`${record?.id}-${record?.key}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
          />
          <Button
            className="action-btn"
            icon={<MdFileCopy />}
            shape="circle"
            type="text"
          />
          <Button
            className="action-btn"
            icon={<RiDeleteBinFill />}
            shape="circle"
            type="text"
          />
        </Space>
      );
    },
  },
];

const ManageSurvey = () => {
  const optionValues = store.useState((s) => s?.optionValues);
  const { languages } = optionValues;
  const [form] = Form.useForm();
  const [isSurveyModalVisible, setIsSurveyModalVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("question/type"),
      api.get("member_type/"),
      api.get("isco_type/"),
    ]).then((res) => {
      const [question_type, member_type, isco_type] = res;
      store.update((s) => {
        s.optionValues = {
          ...s.optionValues,
          question_type: question_type?.data,
          member_type: member_type?.data,
          isco_type: isco_type?.data,
        };
      });
    });
  }, []);

  return (
    <div id="manage-survey">
      <Row className="container bg-grey">
        <Col span={24}>
          <Title className="page-title" level={3}>
            Manage Surveys
          </Title>
          <Row>
            <Col span={24}>
              <Button
                className="button-add"
                type="primary"
                ghost
                onClick={() => {
                  setIsSurveyModalVisible(true);
                }}
              >
                New Survey
              </Button>
              <Table
                rowKey={(record) => `${record?.key}-${record?.id}`}
                className="table-wrapper"
                columns={columns}
                dataSource={dataSources}
                expandable={{
                  defaultExpandAllRows: true,
                  expandedRowRender: (record) => (
                    <p
                      key={`${record.id}-description`}
                      className="expanded-description"
                    >
                      {record.description}
                    </p>
                  ),
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* New Survey Modal */}
      <Modal
        forceRender={true}
        title={<Title level={4}>Survey Details</Title>}
        visible={isSurveyModalVisible}
        footer={
          <Space>
            <Button onClick={() => setIsSurveyModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" ghost onClick={() => form.submit()}>
              Create Survey
            </Button>
          </Space>
        }
        onCancel={() => setIsSurveyModalVisible(false)}
      >
        <Form
          form={form}
          name="survey-detail"
          onFinish={(values) => console.log(values)}
          onFinishFailed={({ values, errorFields }) =>
            console.log(values, errorFields)
          }
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input survey name" }]}
          >
            <Input className="bg-grey" placeholder="Survey Name" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea
              className="bg-grey"
              placeholder="Survey Description"
              rows={3}
            />
          </Form.Item>
          <Form.Item name="languages">
            <Select
              mode="multiple"
              showSearch={true}
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Languages"
              options={languages?.map((lang) => ({
                label: lang?.name,
                value: lang?.code,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSurvey;
