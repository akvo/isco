import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Table,
  Space,
  Button,
  Popconfirm,
  Select,
  notification,
} from "antd";
import { api, store } from "../../lib";
import { RiPencilFill, RiDeleteBinFill, RiPrinterFill } from "react-icons/ri";
import { useNotification } from "../../util";
import { handleLoad } from "../../util/common";
import moment from "moment";

const CurrentRoadmap = ({ setCurrentTab, setEditDatapoint }) => {
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});
  const [filterMember, setFilterMember] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const memberTypes = store.useState((s) => s.optionValues.member_type);

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const memberTypeOptions = useMemo(() => {
    return memberTypes
      .filter((mt) => mt.name.toLowerCase() !== "all")
      .map((mt) => ({
        label: mt.name,
        value: mt.id,
      }));
  }, [memberTypes]);

  const loadRoadmapData = useCallback(() => {
    setIsLoading(true);
    let url = `/roadmap-data?page=${page}&page_size=${pageSize}`;
    if (filterMember) {
      url = `${url}&member_type=${filterMember}`;
    }
    api
      .get(url)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.error(e);
        const { status } = e.response;
        if (status === 404) {
          setData({});
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, pageSize, filterMember]);

  useEffect(() => {
    loadRoadmapData();
  }, [loadRoadmapData]);

  const handleDeleteButton = ({ id, datapoint_name }) => {
    api
      .delete(`/roadmap-data/${id}`)
      .then(() => {
        notify({
          type: "success",
          message: `Roadmap ${datapoint_name} data deleted.`,
        });
        loadRoadmapData();
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      });
  };

  const handleDownloadButton = ({ id, form }) => {
    setDownloadLoading(id);
    api
      .get(`/roadmap-download/${id}`)
      .then((res) => {
        setDownloadData(res?.data);
        setTimeout(() => {
          const print = document.getElementById("print-iframe");
          if (print) {
            const today = moment().format("MMMM Do YYYY");
            const title = `${form}_${today}`;
            // for firefox
            print.contentDocument.title = title;
            // hack for chrome
            document.title = title;
            print.focus();
            print.contentWindow.print();
          }
        }, 2500);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        if (status === 410) {
          notification.warning({
            message: "Expired",
            description: "Download link has been expired.",
          });
        } else {
          notify({
            type: "error",
            message: "Something went wrong.",
          });
        }
      })
      .finally(() => {
        setTimeout(() => {}, 2500);
        setDownloadLoading(null);
      });
  };

  if (window.frames?.["print-iframe"]) {
    window.frames["print-iframe"].contentWindow.onafterprint = function () {
      document.title = "ISCO";
      setDownloadData(null);
    };
    setTimeout(() => {
      document.title = "ISCO";
    }, 1000);
  }

  const columns = [
    {
      title: "Datapoint Name",
      key: "datapoint_name",
      dataIndex: "datapoint_name",
    },
    {
      title: "Submitted Date",
      key: "submitted_date",
      dataIndex: "submitted_date",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space key={`roadmap-data-action-${record.id}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
            onClick={() => {
              setCurrentTab("setup-roadmap");
              setEditDatapoint(record);
            }}
          />
          <Popconfirm
            title="Delete roadmap data can't be undone."
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
          <Button
            loading={record.id === downloadLoading}
            className="action-btn"
            icon={<RiPrinterFill />}
            shape="circle"
            type="text"
            onClick={() => handleDownloadButton(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div id="current-roadmap">
      <Row
        className="filter-wrapper"
        align="middle"
        justify="space-between"
        gutter={[20, 20]}
      >
        <Col flex={1} align="start">
          <Select
            allowClear
            showSearch
            className="member-dropdown-wrapper"
            placeholder="Member Type"
            options={memberTypeOptions}
            onChange={setFilterMember}
            value={filterMember}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
            }
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey={(record) => `roadmap-data-${record.id}`}
            className="table-wrapper"
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            pagination={{
              current: data?.current,
              pageSize: pageSize,
              total: data?.total,
              onChange: (val) => {
                setPage(val);
              },
            }}
          />
        </Col>
      </Row>
      {downloadData && (
        <iframe
          id="print-iframe"
          title={Math.random()}
          srcDoc={downloadData}
          frameBorder={0}
          height={0}
          width={0}
          style={{
            visibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

export default CurrentRoadmap;
