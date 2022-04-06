import React, { useState } from "react";
import { Row, Input, Button } from "antd";

const CommentField = ({ onChange }) => {
  const [showField, setShowField] = useState(false);

  return (
    <Row>
      <Button size="small" type="link" onClick={() => setShowField(!showField)}>
        Add Comment
      </Button>
      {showField && <Input.TextArea rows={3} onChange={onChange} />}
    </Row>
  );
};

export default CommentField;
