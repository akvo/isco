import React, { useState, useMemo } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusSquareFilled, DeleteFilled } from "@ant-design/icons";
import { uiText } from "../../static";
import { store } from "../../lib";

const CommentField = ({ onChange, onDelete, defaultValue }) => {
  const [showField, setShowField] = useState(false);
  const isVisible = showField || defaultValue;

  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

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
            <DeleteFilled /> {text.btnDeleteComment}
          </Button>
        ) : (
          <Button size="small" type="link" onClick={() => setShowField(true)}>
            <PlusSquareFilled /> {text.btnAddComment}
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
