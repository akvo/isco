import React from "react";
import { Table } from "antd";

const repeatColumns = [
  {
    title: "Repeat",
    dataIndex: "label",
    key: "label",
    width: "30%",
  },
  {
    title: "Field",
    dataIndex: "field",
    key: "field",
  },
];

const RepeatTableView = ({ id, dataSource = [] }) => (
  <Table
    className="arf-field-child"
    rowKey={(record) => {
      return `${id}-${record?.label}`;
    }}
    size="small"
    showHeader={false}
    columns={repeatColumns}
    dataSource={dataSource}
    pagination={false}
    bordered={false}
  />
);

export default RepeatTableView;
