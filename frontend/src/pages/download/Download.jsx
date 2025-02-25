import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  notification,
  Select,
} from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";
import { useNotification } from "../../util";
import { handleLoad } from "../../util/common";
import moment from "moment";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const Download = () => {
  const { notify } = useNotification();
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("request");

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const status = [
    { name: text.tbColAll, value: "all" },
    { name: text.tbColSubmitted, value: 1 },
    { name: text.tbColSaved, value: 0 },
  ];

  const handleRequestButton = (id) => {
    setRequestLoading(id);
    api
      .post(`/download/new/${id}`)
      .then(() => {
        const newData = data.map((x) => ({
          ...x,
          status: id === x.id ? "pending" : x.status,
        }));
        setData(newData);
        notification.info({
          message: text.popupDownloadRequestMessage,
          description: text.popupDownloadRequestDescription,
        });
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Something went wrong.",
        });
      })
      .finally(() => {
        setRequestLoading(null);
      });
  };

  const handleDownloadButton = (record) => {
    const { form, uuid } = record;
    setDownloadLoading(uuid);
    api
      .get(`/download/file/${uuid}`)
      .then((res) => {
        setDownloadData(res?.data);
        setTimeout(() => {
          setDownloadLoading(null);
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
        setDownloadLoading(null);
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

  const filterButtons = [
    {
      key: "request",
      label: "Request Download",
      onClick: () => {
        setStatusFilter("request");
      },
    },
    {
      key: "pending",
      label: "Pending",
      onClick: () => {
        setStatusFilter("pending");
      },
    },
    {
      key: "approved",
      label: "Ready for Download",
      onClick: () => {
        setStatusFilter("approved");
      },
    },
    {
      key: "all",
      label: "All",
      onClick: () => {
        setStatusFilter("all");
      },
    },
  ];

  const columns = [
    {
      title: text.formNameText,
      dataIndex: "form",
      key: "form",
      width: "10%",
      render: (_, record) => {
        if (
          record.form_type === "project" &&
          record.name &&
          record.name !== ""
        ) {
          return `${record.form} - ${record.name}`;
        }
        return record.form;
      },
    },
    {
      title: text.formTypeText,
      dataIndex: "form_type",
      key: "form_type",
      width: "10%",
      render: (value) => (value ? value?.toUpperCase() : "-"),
    },
    {
      title: text.formStatusText,
      dataIndex: "submitted",
      key: "submitted",
      width: "10%",
      render: (value) => (value ? "Submitted" : "Saved"),
    },
    {
      title: text.submittedDateText,
      dataIndex: "submitted",
      key: "submitted",
      width: "12%",
      render: (value) => (value ? value : "-"),
    },
    {
      title: text.actionText,
      dataIndex: "",
      key: "action",
      width: "8%",
      render: (record) => {
        const { status, id, uuid } = record;
        if (status === "approved") {
          return (
            <Button
              onClick={() => handleDownloadButton(record)}
              loading={uuid === downloadLoading}
              type="primary"
              ghost
            >
              Download
            </Button>
          );
        }
        if (!status || status === "expired") {
          return (
            <Button
              className="action-btn"
              onClick={() => handleRequestButton(id)}
              loading={id === requestLoading}
            >
              Request
            </Button>
          );
        }
        if (status === "pending") {
          return "PENDING";
        }
      },
    },
  ];

  useEffect(() => {
    getData(activeFilter, statusFilter);
  }, [activeFilter, statusFilter]);

  const getData = (submitted, status) => {
    setIsLoading(true);
    function addQueryParam(url, key, value) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(
        value
      )}`;
    }
    let url = "/download/list?";
    if ((submitted || submitted === 0) && submitted !== "all") {
      url = addQueryParam(url, "submitted", submitted);
    }
    if (status && status !== "all") {
      url = addQueryParam(url, "status", status);
    }
    api
      .get(url)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        if (status === 404) {
          setData([]);
        }
        console.error(status, statusText);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleStatusFilter = (submitStatus) => {
    const submitted = submitStatus || submitStatus === 0 ? submitStatus : "all";
    setActiveFilter(submitted);
  };

  return (
    <div id="download-data">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24}>
              <Title className="page-title" level={3}>
                {text.downloadDataText}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="download-filter-wrapper">
              <div>
                <Space>
                  {filterButtons.map((fb) => (
                    <Button
                      key={fb.key}
                      onClick={fb.onClick}
                      ghost={fb.key === statusFilter ? false : true}
                      type={fb.key === statusFilter ? "default" : "text"}
                    >
                      {fb.label}
                    </Button>
                  ))}
                </Space>
              </div>
              <div>
                <Space
                  style={{
                    background: "#dfdfdf",
                    paddingLeft: 10,
                    borderRadius: "5px 0 0 5px",
                  }}
                >
                  <label style={{ fontSize: 14, fontWeight: 500 }}>
                    Status:
                  </label>
                  <Select
                    style={{ width: "200px" }}
                    showSearch
                    className="member-dropdown-wrapper"
                    placeholder="Select Status"
                    options={status.map((o) => ({
                      label: o.name,
                      value: o.value,
                    }))}
                    onChange={handleStatusFilter}
                    onClear={() => setActiveFilter("all")}
                    value={activeFilter}
                    filterOption={(input, option) =>
                      option?.label
                        ?.toLowerCase()
                        .indexOf(input?.toLowerCase()) >= 0
                    }
                    {...globalSelectProps}
                  />
                </Space>
              </div>
            </Col>
            <Col span={24}>
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: "8px" }}
              >
                <Table
                  loading={isLoading}
                  rowKey={(record) => `${record?.key}-${record?.id}`}
                  className="table-wrapper"
                  columns={columns}
                  dataSource={data}
                />
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      {downloadData && (
        <iframe
          id="print-iframe"
          title={Math.random()}
          srcDoc={downloadData}
          height={0}
          width={0}
          style={{
            visibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            border: 0,
          }}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

export default Download;
