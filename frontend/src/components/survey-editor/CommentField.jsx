import React, { useMemo } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusSquareFilled, DeleteFilled } from "@ant-design/icons";
import { uiText } from "../../static";
import { store } from "../../lib";

const CommentField = ({ qid, onAdd, onChange, onDelete, value = null }) => {
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <Row className="comment-field-wrapper">
      <Col span={24} align="end" className="button-placement">
        <Button
          id={qid ? `delete-comment-${qid}` : null}
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
          id={qid ? `add-comment-${qid}` : null}
          style={{ display: "initial" }}
          name="add-button"
          size="small"
          type="link"
          onClick={(curr) => (onAdd ? onAdd(curr) : null)}
        >
          <PlusSquareFilled /> {text.btnAddComment}
        </Button>
      </Col>
      <Col span="24">
        <Input.TextArea
          id={qid ? `comment-${qid}` : null}
          name="text-area"
          style={{ display: "none" }}
          rows={3}
          onChange={onChange}
          value={value}
        />
      </Col>
    </Row>
  );
};

export default CommentField;
