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
  Alert,
} from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";

const { Title } = Typography;

const Download = () => {
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const [data, setData] = useState({
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const pageSize = 10;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const handleRequestButton = (id) => {
    setRequestLoading(id);
    api
      .post(`/download/new/${id}`)
      .then(() => {
        const newData = data.data.map((x) => ({
          ...x,
          status: id === x.id ? "pending" : x.status,
        }));
        setData({ ...data, data: newData });
        notification.info({
          message: text.popupDownloadRequestMessage,
          description: text.popupDownloadRequestDescription,
          duration: 8,
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setRequestLoading(null);
      });
  };

  const handleDownloadButton = (uuid) => {
    setDownloadLoading(uuid);
    api
      .get(`/download/file/${uuid}`)
      .then((res) => {
        setDownloadData(res?.data);
        setTimeout(() => {
          window.frames[0].print();
        }, 500);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setDownloadLoading(null);
      });
  };

  if (window.frames[0]) {
    window.frames[0].onafterprint = function () {
      setDownloadData(null);
    };
  }

  const columns = [
    {
      title: "Form Name",
      dataIndex: "form",
      key: "form",
      className: "bg-grey",
      width: "10%",
    },
    {
      title: "Form Type",
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
      title: "Submitted Date",
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
        const { status, id, uuid } = record;
        if (status === "approved") {
          return (
            <Button
              className="action-btn"
              onClick={() => handleDownloadButton(uuid)}
              loading={uuid === downloadLoading}
            >
              Download
            </Button>
          );
        }
        if (!status) {
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

  const changePage = (page) => {
    setIsLoading(true);
    api
      .get(`/download/list?page=${page}&page_size=${pageSize}`)
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
                <Alert type="info" showIcon message={text.bannerDownloadPage} />
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
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      {downloadData && (
        <iframe
          srcDoc={downloadData}
          frameBorder="0"
          height="700vh"
          width="100%"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
};

export default Download;
