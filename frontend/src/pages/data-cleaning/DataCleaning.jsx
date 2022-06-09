import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Table, Typography, Space, Button, Select } from "antd";
import {
  PlusSquareOutlined,
  CloseSquareOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { api } from "../../lib";
import { DataCleaningWebform, DataDetail } from ".";

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
      title: "Data",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Organisation",
      dataIndex: "organisation_name",
      key: "organisation_name",
    },
    {
      title: "Member Type",
      dataIndex: "member_type",
      key: "member_type",
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
      let url = `/data/form/${formSelected}?page=${page}&perpage=${pageSize}`;
      url += `&submitted=1&filter_same_isco=1`;
      api
        .get(url)
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
      const { id, form_name, organisation, member_type, submitted } = record;
      setFetchingOrgDetail(id);
      api
        .get(`/organisation/${organisation}`)
        .then((res) => {
          setOrgDetail(res.data);
          setEditDatapointName(
            `${form_name} - ${id} - ${member_type} - ${submitted}`
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
      //  reload data
      setIsLoading(true);
      let url = `/data/form/${selectedDatapoint.form}?page=1&perpage=${pageSize}`;
      url += `&submitted=1&filter_same_isco=1`;
      api
        .get(url)
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
                datapoint={{
                  ...selectedDatapoint,
                  datapoint_name: editDatapointName,
                }}
                orgDetail={orgDetail}
                handleBack={handleBack}
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
                scroll={{ y: 500 }}
                pagination={{
                  current: data?.current,
                  pageSize: pageSize,
                  total: data?.total,
                  onChange: (page) => setPage(page),
                }}
                expandable={{
                  expandedRowKeys,
                  expandedRowRender: (record) => <DataDetail record={record} />,
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
