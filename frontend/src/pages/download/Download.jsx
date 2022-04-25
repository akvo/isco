import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Typography, Table, Button, Space } from "antd";
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
  const pageSize = 10;

  const handleRequestButton = (record) => {
    console.info(record);
  };

  const columns = [
    {
      title: "Form",
      dataIndex: "form",
      key: "form",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Type",
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
      title: "Initiated by",
      dataIndex: "created_by",
      key: "created_by",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Date Created",
      dataIndex: "created",
      key: "created",
      className: "bg-grey",
      width: "12%",
    },
    {
      title: "Date Submitted",
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
        return (
          <Space key={`${record?.id}-${record?.key}`}>
            <Button
              className="action-btn"
              shape="circle"
              type="text"
              onClick={() => handleRequestButton(record)}
            >
              Request
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/data/submitted?page=1`)
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
      .get(`/data/submitted?page=${page}&page_size=${pageSize}`)
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
