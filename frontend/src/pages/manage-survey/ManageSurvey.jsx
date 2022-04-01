import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Popconfirm,
} from "antd";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";
import { FormEditor } from "../../components";
import { api } from "../../lib";
import { useNotification } from "../../util";

const { Title } = Typography;

const ManageSurvey = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSurveyModalVisible, setIsSurveyModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotification();

  const handleEditButton = (record) => {
    const { id, has_question_group } = record;
    // if doesn't have question group, create first question group
    if (!has_question_group) {
      api
        .post(`/default_question_group/${id}/1`)
        .then(() => {
          navigate(`/survey-editor/${id}`);
        })
        .catch((e) => {
          console.error(e);
        });
      return;
    }
    navigate(`/survey-editor/${id}`);
  };

  const handleDeleteButton = (record) => {
    const { id } = record;
    api
      .delete(`/form/${id}`)
      .then(() => {
        setDataSource(dataSource?.filter((d) => d?.id !== id));
        notify({
          type: "success",
          message: "Survey deleted successfully.",
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "bg-grey title",
      width: "25%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      className: "bg-grey",
      width: "40%",
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      className: "bg-grey",
      width: "5%",
      render: (value) => (value ? value : 0.0),
    },
    {
      title: "Date Created",
      dataIndex: "created",
      key: "created",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Date Published",
      dataIndex: "published",
      key: "published",
      className: "bg-grey",
      width: "12%",
      render: (value) => (value ? value : "-"),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      className: "bg-grey",
      width: "8%",
      render: (record) => {
        return (
          <Space key={`${record?.id}-${record?.key}`}>
            <Button
              className="action-btn"
              icon={<RiPencilFill />}
              shape="circle"
              type="text"
              onClick={() => handleEditButton(record)}
            />
            <Popconfirm
              title="Delete survey can't be undone."
              okText="Delete"
              cancelText="Cancel"
              onConfirm={() => handleDeleteButton(record)}
            >
              <Button
                className="action-btn"
                icon={<RiDeleteBinFill />}
                shape="circle"
                type="text"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .get("/form/")
      .then((res) => {
        const data = res?.data?.map((item) => ({
          ...item,
          status: null,
        }));
        setDataSource(data);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const onSubmitForm = (values) => {
    let data = {};
    Object.keys(values)?.forEach((key) => {
      const field = key.split("-")[1];
      data = {
        ...data,
        ...{ [field]: values[key] },
      };
    });
    if (!data?.description) {
      data = {
        ...data,
        description: null,
      };
    }
    if (!data?.languages) {
      data = {
        ...data,
        languages: null,
      };
    }
    api
      .post("/form", data, { "content-type": "application/json" })
      .then((res) => {
        const data = {
          ...res?.data,
          user: "John Doe",
          status: null,
        };
        setDataSource([...dataSource, data]);
        notify({
          type: "success",
          message: "Survey saved successfully.",
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      })
      .finally(() => {
        setIsSurveyModalVisible(false);
        form.resetFields();
      });
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
                loading={isLoading}
                rowKey={(record) => `${record?.key}-${record?.id}`}
                className="table-wrapper"
                columns={columns}
                dataSource={dataSource}
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
        <Form form={form} name="survey-detail" onFinish={onSubmitForm}>
          <FormEditor form={form} />
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSurvey;
