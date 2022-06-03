import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Table, Typography, Space, Button, Select } from "antd";
import {
  PlusSquareOutlined,
  CloseSquareOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { api } from "../../lib";
import DataCleaningWebform from "./DataCleaningWebform";

const { Title } = Typography;

const DataCleaning = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDatapoint, setSelectedDatapoint] = useState(null);
  const [editDatapointName, setEditDatapointName] = useState(null);
  const [fetchingOrgDetail, setFetchingOrgDetail] = useState(false);
  const [orgDetail, setOrgDetail] = useState({});

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
      dataIndex: "organisation_name",
      key: "organisation_name",
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
      render: (record) => {
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() => handleEditOnClick(record)}
              loading={fetchingOrgDetail === record?.id}
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
          `/data/form/${formSelected}?submitted=1&filter_same_isco=1&page=${page}&page_size=${pageSize}`
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

  const handleEditOnClick = (record) => {
    if (record?.organisation && record?.id) {
      const {
        id,
        form_name,
        organisation,
        organisation_name,
        submitted_by,
        submitted,
      } = record;
      setFetchingOrgDetail(id);
      api
        .get(`/organisation/${organisation}`)
        .then((res) => {
          setOrgDetail(res.data);
          setEditDatapointName(
            `${form_name} - ${organisation_name} - ${submitted_by} - ${submitted}`
          );
          setSelectedDatapoint(record);
          setTimeout(() => {
            setExpandedRowKeys([]);
            setIsEdit(true);
          }, 500);
        })
        .catch((e) => console.error(e))
        .finally(() => {
          setTimeout(() => {
            setFetchingOrgDetail(false);
          }, 500);
        });
    }
  };

  const handleBack = () => {
    if (isEdit) {
      setIsEdit(false);
      setEditDatapointName(null);
      setOrgDetail({});
    }
  };

  if (isEdit && orgDetail?.id) {
    return (
      <div id="data-cleaning">
        <Row className="container" align="top" justify="center">
          <Col span={24}>
            <Row
              className="page-title-wrapper"
              align="middle"
              justify="space-between"
            >
              <Col span={24} align="start">
                <Space align="middle" size={20}>
                  <Title
                    className={`page-title ${isEdit ? "clickable" : ""}`}
                    level={3}
                    onClick={handleBack}
                  >
                    Data Cleaning
                  </Title>
                  {isEdit && (
                    <RightOutlined
                      className="page-title separator"
                      style={{ fontSize: "24px" }}
                    />
                  )}
                  {isEdit && (
                    <Title className="page-title datapoint-name" level={4}>
                      {editDatapointName}
                    </Title>
                  )}
                </Space>
              </Col>
            </Row>
            <div className="webform-wrapper">
              <DataCleaningWebform
                datapoint={selectedDatapoint}
                orgDetail={orgDetail}
              />
            </div>
          </Col>
        </Row>
      </div>
    );
  }

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
              <Title
                className={`page-title ${isEdit ? "clickable" : ""}`}
                level={3}
                onClick={handleBack}
              >
                Data Cleaning
              </Title>
            </Col>
          </Row>
          <Row className="filter-wrapper">
            <Col span={24}>
              <Select
                showArrow
                showSearch
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
                rowKey="id"
                className="table-wrapper"
                columns={
                  data?.data?.length
                    ? [...columns, Table.EXPAND_COLUMN]
                    : columns
                }
                dataSource={data?.data ? data.data : []}
                loading={isLoading}
                pagination={{
                  current: data?.current,
                  pageSize: pageSize,
                  total: data?.total,
                  onChange: (page) => setPage(page),
                }}
                expandable={{
                  expandedRowKeys,
                  expandedRowRender: (record) => {
                    return (
                      <div>
                        <Table
                          size="small"
                          pagination={false}
                          dataSource={record.answer}
                          rowKey={(answer, ri) =>
                            `${record.id}-${answer.question}-${ri}`
                          }
                          columns={[
                            {
                              title: "Question",
                              dataIndex: "question_name",
                            },
                            {
                              title: "Answer",
                              dataIndex: "value",
                              render: (val) => val || "-",
                            },
                            {
                              title: "Comment",
                              dataIndex: "comment",
                              render: (val) => val || "-",
                            },
                          ]}
                        />
                      </div>
                    );
                  },
                  expandIcon: ({ expanded, onExpand, record }) => {
                    return expanded ? (
                      <CloseSquareOutlined
                        onClick={(e) => {
                          setExpandedRowKeys([]);
                          onExpand(record, e);
                        }}
                        style={{ color: "#e94b4c", margin: "0 5px" }}
                      />
                    ) : (
                      <PlusSquareOutlined
                        onClick={(e) => {
                          setExpandedRowKeys([record.id]);
                          onExpand(record, e);
                        }}
                        style={{ color: "#7d7d7d", margin: "0 5px" }}
                      />
                    );
                  },
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
