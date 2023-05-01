import React, { useState, useMemo } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusSquareFilled, DeleteFilled } from "@ant-design/icons";
import { uiText } from "../../static";
import { store } from "../../lib";

const CommentField = ({ onChange, onDelete }) => {
  const [showField, setShowField] = useState(false);
  const isVisible = showField;

  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <Row className="comment-field-wrapper">
      <Col span={24} align="end" className="button-placement">
        <Button
          style={{ display: isVisible ? "initial" : "none" }}
          name="delete-button"
          size="small"
          type="link"
          onClick={(curr) => {
            setShowField(false);
            onDelete(curr);
          }}
        >
          <DeleteFilled /> {text.btnDeleteComment}
        </Button>
        <Button
          style={{ display: isVisible ? "none" : "initial" }}
          name="add-button"
          size="small"
          type="link"
          onClick={() => setShowField(true)}
        >
          <PlusSquareFilled /> {text.btnAddComment}
        </Button>
      </Col>
      <Col span="24">
        <Input.TextArea
          name="text-area"
          style={{ display: isVisible ? "initial" : "none" }}
          rows={3}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

export default CommentField;
