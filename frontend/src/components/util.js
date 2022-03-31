import React from "react";
import { Spin, Space } from "antd";

export const DimScreen = ({ text = "Loading" }) => {
  return (
    <div className="dimscreen-loading">
      <Space direction="vertical" align="center">
        <Spin size="large" />
        <h3>{text}</h3>
      </Space>
    </div>
  );
};
