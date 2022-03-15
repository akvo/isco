import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";
import { MdFileCopy } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { dataSources } from "./static";
import { FormEditor } from "../../components";

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
  const [form] = Form.useForm();
  const [isSurveyModalVisible, setIsSurveyModalVisible] = useState(false);
  const navigate = useNavigate();

  const onSubmitForm = (values) => {
    console.log(values);
    navigate("/survey-editor");
  };

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
          onFinish={onSubmitForm}
          onFinishFailed={({ values, errorFields }) =>
            console.log(values, errorFields)
          }
        >
          <FormEditor form={form} />
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSurvey;
