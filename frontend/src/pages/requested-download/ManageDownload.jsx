import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Table, Typography, Space, Button } from "antd";
import { api } from "../../lib";

const { Title } = Typography;

const ManageDownload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
  });

  const columns = [
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
    },
    {
      title: "Form Type",
      dataIndex: "form_type",
      key: "form_type",
      render: (value) => value.toUpperCase(),
    },
    {
      title: "Request By",
      dataIndex: "request_by_name",
      key: "request_by_name",
    },
    {
      title: "Request Date",
      dataIndex: "request_date",
      key: "request_date",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => {
        console.info(record);
        return (
          <Space>
            <Button size="small" type="primary" ghost>
              View
            </Button>
            <Button size="small" type="primary">
              Approve
            </Button>
            <Button size="small" type="primary" danger>
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/download/requested?page=${page}&page_size=${pageSize}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, pageSize]);

  return (
    <div id="requested-download">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Manage Download
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record) =>
                  `${record.organisation}-${record.form_type}`
                }
                className="table-wrapper"
                columns={columns}
                dataSource={data?.data ? data.data : []}
                loading={isLoading}
                pagination={{
                  current: data?.current,
                  pageSize: pageSize,
                  total: data?.total,
                  onChange: (page) => setPage(page),
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ManageDownload;
