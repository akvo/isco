import React, { useEffect, useState } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Table,
  Typography,
  Space,
  Button,
  Popconfirm,
  Modal,
} from "antd";
import { api } from "../../lib";
import { useNotification } from "../../util";

const { Title } = Typography;

const ButtonApproveReject = ({
  handleApproveRejectRequest,
  record,
  isApprove,
  isReject,
}) => {
  const enableReject = false;
  const isApproved = record?.status === "approved";
  return (
    <Space>
      <Popconfirm
        title="Are you sure want to approve this download request?"
        okText="Approve"
        cancelText="Cancel"
        onConfirm={() => handleApproveRejectRequest(record, true)}
      >
        <Button
          size="small"
          type="primary"
          loading={isApprove === record?.id}
          disabled={isApproved}
        >
          {isApproved ? "Approved" : "Approve"}
        </Button>
      </Popconfirm>
      {enableReject && (
        <Popconfirm
          title="Are you sure want to reject this download request?"
          okText="Reject"
          okButtonProps={{ type: "danger" }}
          cancelText="Cancel"
          onConfirm={() => handleApproveRejectRequest(record, false)}
        >
          <Button
            size="small"
            type="primary"
            danger
            loading={isReject === record?.id}
          >
            Reject
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
};

const ManageDownload = () => {
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(null);
  const [isReject, setIsReject] = useState(null);
  const [isView, setIsView] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
  });

  const handleApproveRejectRequest = (record, approve) => {
    const approved = approve ? 1 : 0;
    const { uuid, id } = record;
    approve ? setIsApprove(id) : setIsReject(id);
    api
      .put(`/download/${uuid}?approved=${approved}`)
      .then((res) => {
        const { data: updatedData } = res;
        notify({
          type: "success",
          message: approve
            ? "Download approved successfully."
            : "Download rejected successfully.",
        });
        const transformData = data.data.map((d) => {
          if (d.id === updatedData.id) {
            return updatedData;
          }
          return d;
        });
        setData({ ...data, data: transformData });
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Something went wrong.",
        });
      })
      .finally(() => {
        approve ? setIsApprove(null) : setIsReject(null);
        setModalViewVisible(false);
      });
  };

  const handleViewRequest = (record) => {
    const { uuid, id } = record;
    setIsView(id);
    api
      .get(`/download/view/${uuid}`)
      .then((res) => {
        setSelectedRecord(record);
        setViewData(res?.data);
        setModalViewVisible(true);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsView(null);
      });
  };

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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => value.toUpperCase(),
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
              onClick={() => handleViewRequest(record)}
              loading={isView === record?.id}
            >
              View
            </Button>
            <ButtonApproveReject
              handleApproveRejectRequest={handleApproveRejectRequest}
              record={record}
              isApprove={isApprove}
              isReject={isReject}
            />
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

      {/* Modal View */}
      <Modal
        title="View Data"
        visible={modalViewVisible}
        onCancel={() => setModalViewVisible(false)}
        centered
        destroyOnClose
        width="95vw"
        className="download-view-modal"
        footer={
          <Space>
            <Button onClick={() => setModalViewVisible(false)}>Close</Button>
            <ButtonApproveReject
              handleApproveRejectRequest={handleApproveRejectRequest}
              record={selectedRecord}
              isApprove={isApprove}
              isReject={isReject}
            />
          </Space>
        }
      >
        <iframe srcDoc={viewData} frameBorder="0" height="700vh" width="100%" />
      </Modal>
    </div>
  );
};

export default ManageDownload;
