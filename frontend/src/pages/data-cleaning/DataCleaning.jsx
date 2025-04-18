import React, { useState, useEffect, useCallback, useRef } from "react";
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
  InputNumber,
} from "antd";
import {
  PlusSquareOutlined,
  RightOutlined,
  MinusSquareOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { api, store } from "../../lib";
import DataCleaningWebform from "./DataCleaningWebform";
import DataDetail from "./DataDetail";
import { useNotification } from "../../util";
import { MonitoringRoundSelector } from "../../components";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const DataCleaning = () => {
  const webformRef = useRef(null);
  const { optionValues } = store.useState((s) => s);
  const { organisationInSameIsco } = optionValues;
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
  const [organisationValue, setOrganisationValue] = useState(null);
  const [dataID, setDataID] = useState(null);
  const [filters, setFilters] = useState({
    formSelected: null,
    selectedMonitoringRound: null,
    organisationValue: null,
    dataID: null,
  });

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
      title: "Form Name",
      dataIndex: "form_name",
      key: "form_name",
      width: "20%",
    },
    {
      title: "Organisation",
      dataIndex: "organisation_name",
      key: "organisation_name",
      width: "15%",
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
      align: "left",
      render: (record) => {
        const currentTime = new Date();
        const year = currentTime.getFullYear();
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
            {new Date(record.submitted)?.getFullYear() === year && (
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
            )}
          </Space>
        );
      },
      width: "200px",
    },
  ];

  const handleOrganisationFilter = (org) => {
    setOrganisationValue(org);
  };

  const handleDataIDFilter = (value) => {
    setDataID(value);
  };

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
    const { formSelected, dataID, selectedMonitoringRound, organisationValue } =
      filters;
    if (formSelected || dataID) {
      setIsLoading(true);
      let url = `/data/form/${
        formSelected || "all"
      }?page=${page}&perpage=${pageSize}`;
      url = `${url}&submitted=1&filter_same_isco=1`;
      if (selectedMonitoringRound) {
        url = `${url}&monitoring_round=${selectedMonitoringRound}`;
      }
      if (organisationValue) {
        url = `${url}&organisation=${organisationValue}`;
      }
      if (dataID) {
        url = `${url}&data_id=${dataID}`;
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
    } else {
      setData({
        current: 1,
        data: [],
        total: 0,
        total_page: 0,
      });
    }
  }, [page, pageSize, filters]);

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
                <Space align="middle" size={15}>
                  <Title
                    className={`page-title ${isEdit ? "clickable" : ""}`}
                    level={3}
                    onClick={handleBack}
                    style={{ minWidth: 175 }}
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
                webformRef={webformRef}
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
          <Row className="filter-wrapper" gutter={[20, 20]}>
            <Col flex={1}>
              {" "}
              <Space wrap>
                <InputNumber
                  placeholder="Data ID"
                  controls={false}
                  onChange={handleDataIDFilter}
                  value={dataID}
                  // disabled={!formSelected}
                />
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
                  {...globalSelectProps}
                />
                <Select
                  showSearch
                  className="custom-dropdown-wrapper"
                  placeholder="Organization"
                  options={
                    organisationInSameIsco.length
                      ? organisationInSameIsco.map((o) => ({
                          label: o.name,
                          value: o.id,
                        }))
                      : []
                  }
                  onChange={handleOrganisationFilter}
                  value={organisationValue}
                  filterOption={(input, option) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                  disabled={!formSelected}
                  {...globalSelectProps}
                />
                <MonitoringRoundSelector
                  value={selectedMonitoringRound}
                  onChange={setSelectedMonitoringRound}
                  disabled={!formSelected}
                />
                <Button
                  icon={<SearchOutlined />}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      formSelected,
                      selectedMonitoringRound,
                      organisationValue,
                      dataID,
                    }))
                  }
                  disabled={formSelected || dataID ? false : true}
                  type="primary"
                  ghost
                >
                  Search
                </Button>
              </Space>
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
                      <MinusSquareOutlined
                        onClick={(e) => {
                          setExpandedRowKeys([]);
                          onExpand(record, e);
                        }}
                        style={{ color: "#7d7d7d", margin: "0 5px" }}
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
