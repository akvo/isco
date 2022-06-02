import React from "react";
import "./style.scss";
import { Row, Col, Table, Typography } from "antd";

const { Title } = Typography;

const DataCleaning = () => {
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
              <Title className="page-title" level={3}>
                Data Cleaning
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                // rowKey={(record, ri) =>
                //   `${record.organisation}-${record.form_type}-${ri}`
                // }
                className="table-wrapper"
                // columns={columns}
                // dataSource={data?.data ? data.data : []}
                // loading={isLoading}
                // pagination={{
                //   current: data?.current,
                //   pageSize: pageSize,
                //   total: data?.total,
                //   onChange: (page) => setPage(page),
                // }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DataCleaning;
