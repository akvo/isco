import React, { useEffect, useState } from "react";
import { Row, Col, Table, Space, Button, Popconfirm } from "antd";
import { api } from "../../lib";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";

const CurrentRoadmap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const pageSize = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/roadmap-data?page=${page}&page_size=${pageSize}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

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
        <Space key={`${record?.id}-${record?.key}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
            // onClick={() => {

            // }}
          />
          <Popconfirm
            title="Delete roadmap data can't be undone."
            okText="Delete"
            cancelText="Cancel"
            // onConfirm={() => handleDeleteButton(record)}
          >
            <Button
              className="action-btn"
              icon={<RiDeleteBinFill />}
              shape="circle"
              type="text"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div id="current-roadmap">
      <Row>
        <Col span={24}>
          <Table
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
    </div>
  );
};

export default CurrentRoadmap;
