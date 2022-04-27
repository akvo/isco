import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Typography, Table, Button, Space, notification } from "antd";
import { api } from "../../lib";

const { Title } = Typography;

const Download = () => {
  const [data, setData] = useState({
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(null);
  const pageSize = 10;

  const handleRequestButton = (id) => {
    setRequestLoading(id);
    api
      .post(`/download/new/${id}`)
      .then(() => {
        const newData = data.data.map((x) => ({
          ...x,
          status: id === x.id ? "pending" : x.status,
        }));
        setData({ ...data, data: newData });
        notification.success({
          message: "Success Request",
          description: "Request Download Success",
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setRequestLoading(null);
      });
  };

  const columns = [
    {
      title: "Form Name",
      dataIndex: "form",
      key: "form",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Form Type",
      dataIndex: "form_type",
      key: "form_type",
      className: "bg-grey",
      width: "10%",
      render: (value) => (value ? value.toUpperCase() : "-"),
    },
    {
      title: "Submitter",
      dataIndex: "submitted_by",
      key: "submitted_by",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Submitted Date",
      dataIndex: "submitted",
      key: "submitted",
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
        const pending = record.status === "pending";
        return (
          <Space key={`${record?.id}-${record?.key}`}>
            <Button
              className="action-btn"
              type={pending ? "text" : "secondary"}
              onClick={() => handleRequestButton(record.id)}
              loading={record.id == requestLoading}
              disabled={pending}
            >
              {pending ? "Pending" : "Request"}
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/download/list?page=1`)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const changePage = (page) => {
    setIsLoading(true);
    api
      .get(`/download/list?page=${page}&page_size=${pageSize}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div id="download-data">
      <Row className="container bg-grey">
        <Col span={24}>
          <Title className="page-title" level={3}>
            Download Data
          </Title>
          <Row>
            <Col span={24}>
              <Table
                loading={isLoading}
                rowKey={(record) => `${record?.key}-${record?.id}`}
                className="table-wrapper"
                columns={columns}
                dataSource={data.data}
                pagination={{
                  current: data?.current,
                  pageSize: pageSize,
                  total: data?.total,
                  onChange: changePage,
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Download;
