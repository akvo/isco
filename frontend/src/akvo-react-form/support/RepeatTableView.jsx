import React from "react";
import {
  Row,
  Col,
  // Table
} from "antd";

// const repeatColumns = [
//   {
//     title: "Repeat",
//     dataIndex: "label",
//     key: "label",
//     width: "30%",
//   },
//   {
//     title: "Field",
//     dataIndex: "field",
//     key: "field",
//   },
// ];

const RepeatTableView = ({ id, dataSource = [] }) => {
  // GridView
  return dataSource.map((ds) => {
    return (
      <Row
        key={`${id}-${ds.label}`}
        gutter={[14, 14]}
        align="middle"
        style={{ paddingLeft: "20px" }}
      >
        {!ds?.is_repeat_identifier && <Col span={8}>{ds.label}</Col>}
        <Col span={ds?.is_repeat_identifier ? 24 : 16}>{ds.field}</Col>
      </Row>
    );
  });

  // TableView
  // return (
  //   <Table
  //     className="arf-field-child"
  //     rowKey={(record) => {
  //       return `${id}-${record?.label}`;
  //     }}
  //     size="small"
  //     showHeader={false}
  //     columns={repeatColumns}
  //     dataSource={dataSource}
  //     pagination={false}
  //     bordered={false}
  //   />
  // );
};

export default RepeatTableView;
