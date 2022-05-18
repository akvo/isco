import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Typography, Table, Button, Space, notification } from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";
import { useNotification } from "../../util";
import moment from "moment";

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

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

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
          duration: 8,
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
        setTimeout(() => {
          setDownloadLoading(null);
        }, 2500);
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

  const handleLoad = (event) => {
    const iframe = event.target;
    if (iframe?.contentDocument) {
      let css = "@page {";
      css += "size: 210mm 297mm; margin: 15mm;";
      css += "}";
      css +=
        "* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }";
      const style = document.createElement("style");
      style.type = "text/css";
      style.media = "print";
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      const head = iframe.contentDocument.head;
      if (head) {
        head.appendChild(style);
      }
    }
  };

  const columns = [
    {
      title: "Form Name",
      dataIndex: "form",
      key: "form",
      width: "10%",
    },
    {
      title: "Form Type",
      dataIndex: "form_type",
      key: "form_type",
      width: "10%",
      render: (value) => (value ? value?.toUpperCase() : "-"),
    },
    {
      title: "Submitted Date / Monitoring Round",
      dataIndex: "submitted",
      key: "submitted",
      width: "12%",
      render: (value) => (value ? value : "-"),
    },
    {
      title: "Action",
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

  return (
    <div id="download-data">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Download Data
              </Title>
            </Col>
          </Row>
          <Row>
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

export default Download;
