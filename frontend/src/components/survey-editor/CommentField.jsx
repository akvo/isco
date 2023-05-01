import React, { useMemo } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusSquareFilled, DeleteFilled } from "@ant-design/icons";
import { uiText } from "../../static";
import { store } from "../../lib";

const CommentField = ({ onAdd, onChange, onDelete }) => {
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <Row className="comment-field-wrapper">
      <Col span={24} align="end" className="button-placement">
        <Button
          style={{ display: "none" }}
          name="delete-button"
          size="small"
          type="link"
          onClick={(curr) => {
            onDelete(curr);
          }}
        >
          <DeleteFilled /> {text.btnDeleteComment}
        </Button>
        <Button
          style={{ display: "initial" }}
          name="add-button"
          size="small"
          type="link"
          onClick={(curr) => onAdd(curr)}
        >
          <PlusSquareFilled /> {text.btnAddComment}
        </Button>
      </Col>
      <Col span="24">
        <Input.TextArea
          name="text-area"
          style={{ display: "none" }}
          rows={3}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

export default CommentField;
