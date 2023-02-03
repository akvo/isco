import React, { useState, useEffect, useCallback } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Table,
  Typography,
  Space,
  Button,
  Select,
  Popconfirm,
} from "antd";
import {
  PlusSquareOutlined,
  CloseSquareOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { api } from "../../lib";
import DataCleaningWebform from "./DataCleaningWebform";
import DataDetail from "./DataDetail";
import { useNotification } from "../../util";
import { MonitoringRoundSelector } from "../../components";

const { Title } = Typography;

const DataCleaning = () => {
  const { notify } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDatapoint, setSelectedDatapoint] = useState(null);
  const [editDatapointName, setEditDatapointName] = useState(null);
  const [fetchingOrgDetail, setFetchingOrgDetail] = useState(false);
  const [undoSubmit, setUndoSubmit] = useState(null);
  const [orgDetail, setOrgDetail] = useState({});
  // monitoring round selector
  const [selectedMonitoringRound, setSelectedMonitoringRound] = useState(null);

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "60px",
    },
    {
      title: "Organisation",
      dataIndex: "organisation_name",
      key: "organisation_name",
      width: "20%",
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
      width: "20%",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
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
            <Popconfirm
              placement="left"
              title={`Are you sure to undo submission for data ${record?.id}?`}
              okText="Undo Submit"
              cancelText="Cancel"
              onConfirm={() => handleUndoSubmitOnClick(record)}
            >
              <Button
                size="small"
                type="primary"
                loading={undoSubmit?.id === record?.id}
              >
                Undo Submit
              </Button>
            </Popconfirm>
          </Space>
        );
      },
      width: "200px",
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

  const fetchData = useCallback(() => {
    if (formSelected) {
      setIsLoading(true);
      let url = `/data/form/${formSelected}?page=${page}&perpage=${pageSize}`;
      url = `${url}&submitted=1&filter_same_isco=1`;
      if (selectedMonitoringRound) {
        url = `${url}&monitoring_round=${selectedMonitoringRound}`;
      }
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
  }, [formSelected, page, pageSize, selectedMonitoringRound]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleUndoSubmitOnClick = (record) => {
    if (record?.id) {
      setUndoSubmit(record);
      api
        .put(`/data/unsubmit/${record.id}`)
        .then((res) => {
          fetchData();
          notify({
            type: "success",
            message: `Data ${res.data.id} unsubmitted successfully.`,
          });
        })
        .catch(() => {
          notify({
            type: "error",
            message: `Can't undo submission for data ${record.id}.`,
          });
        })
        .finally(() => {
          setUndoSubmit(null);
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
              <MonitoringRoundSelector
                value={selectedMonitoringRound}
                onChange={setSelectedMonitoringRound}
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
                  onShowSizeChange: (page, pageSize) => {
                    setPage(page);
                    setPageSize(pageSize);
                  },
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
