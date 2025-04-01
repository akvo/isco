import React from "react";
import { Row, Col } from "antd";

const RepeatTableView = ({ id, dataSource = [] }) => {
  // GridView
  return dataSource.map((ds) => {
    if (!React.isValidElement(ds.field)) {
      return "";
    }
    return (
      <Row
        key={`${id}-${ds.label}`}
        gutter={[14, 14]}
        align="top"
        style={{ paddingLeft: "20px", marginBottom: "10px" }}
      >
        {!ds?.is_repeat_identifier && <Col span={5}>{ds.label}</Col>}
        <Col span={ds?.is_repeat_identifier ? 24 : 19}>{ds.field}</Col>
      </Row>
    );
  });
};

export default RepeatTableView;
