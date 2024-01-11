import React from "react";
import { Col } from "antd";

const Extra = ({ id, content, placement }) => {
  return (
    <Col
      name="arf-extra-content"
      arf_qid={id}
      className={`arf-extra-${placement}`}
    >
      {content}
    </Col>
  );
};

export default Extra;
