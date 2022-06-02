import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Table, Typography, Space, Button, Select } from "antd";
import { api } from "../../lib";
// import { useNotification } from "../../util";

const { Title } = Typography;

const DataCleaning = () => {
  // const { notify } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);

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
      title: "Questionnaire",
      dataIndex: "form_name",
      key: "form_name",
    },
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
    },
    {
      title: "Submitter",
      dataIndex: "submitted_by",
      key: "submitted_by",
    },
    {
      title: "Submitted Date",
      dataIndex: "submitted",
      key: "submitted",
    },
    {
      title: "Action",
      key: "action",
      width: "20%",
      render: (record) => {
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() => console.info(record)}
              // loading={isView === record?.id}
            >
              Edit
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    if (!forms.length) {
      api
        .get("/form/published")
        .then((res) => {
          const data = res.data.map((x) => ({
            label: x.label,
            value: x.value,
          }));
          setForms(data);
        })
        .catch((e) => console.error(e));
    }
  }, [forms]);

  useEffect(() => {
    if (formSelected) {
      setIsLoading(true);
      api
        .get(
          `/data/form/${formSelected}?submitted=1&page=${page}&page_size=${pageSize}`
        )
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          console.error(e);
          setData({
            current: 1,
            data: [],
            total: 0,
            total_page: 0,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [formSelected, page, pageSize]);

  return (
    <div id="data-cleaning">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Data Cleaning
              </Title>
            </Col>
          </Row>
          <Row className="filter-wrapper">
            <Col span={24}>
              <Select
                showArrow
                showSearch
                allowClear
                className="custom-dropdown-wrapper"
                placeholder="Select Questionnaire"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={forms}
                value={formSelected}
                onChange={(val) => setFormSelected(val)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record, ri) =>
                  `${record.organisation}-${record.id}-${ri}`
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

export default DataCleaning;
