import React, { useState } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusSquareFilled, DeleteFilled } from "@ant-design/icons";

const CommentField = ({ onChange, onDelete, defaultValue }) => {
  const [showField, setShowField] = useState(false);
  const isVisible = showField || defaultValue;

  return (
    <Row className="comment-field-wrapper">
      <Col span={24} align="end" className="button-placement">
        {isVisible ? (
          <Button
            size="small"
            type="link"
            onClick={() => {
              setShowField(false);
              onDelete();
            }}
          >
            <DeleteFilled /> Delete Comment
          </Button>
        ) : (
          <Button size="small" type="link" onClick={() => setShowField(true)}>
            <PlusSquareFilled /> Add Comment
          </Button>
        )}
      </Col>
      <Col span="24">
        {isVisible && (
          <Input.TextArea
            rows={3}
            onChange={onChange}
            defaultValue={defaultValue}
          />
        )}
      </Col>
    </Row>
  );
};

export default CommentField;
