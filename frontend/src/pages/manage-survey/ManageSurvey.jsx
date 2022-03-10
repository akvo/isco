import React, { useState } from "react";
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
import { IoMdInformationCircleOutline } from "react-icons/io";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";
import { MdFileCopy } from "react-icons/md";
import { dataSources } from "./static";

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
          <IoMdInformationCircleOutline />
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
  const [form] = Form.useForm();
  const [isSurveyModalVisible, setIsSurveyModalVisible] = useState(false);

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
        onOk={() => form.submit()}
        onCancel={() => setIsSurveyModalVisible(false)}
      >
        <Form
          form={form}
          name="survey-detail"
          onFinish={(values) => console.log(values)}
          onFinishFailed={(values, errorFields) =>
            console.log(values, errorFields)
          }
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input survey name" }]}
          >
            <Input placeholder="Survey Name" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Survey Description" rows={3} />
          </Form.Item>
          <Form.Item name="languages">
            <Select placeholder="Languages" options={[]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSurvey;
