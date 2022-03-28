import React from "react";
import { Button, Row, Space } from "antd";

const AddMoveButton = ({
  text,
  onClick,
  className,
  cancelButton = false,
  disabled = false,
  onCancel = () => {},
}) => {
  return (
    <Row
      align="middle"
      justify="start"
      className={`reorder-wrapper ${className}`}
    >
      <Space>
        <Button
          type="secondary"
          className="reorder-button"
          size="small"
          onClick={onClick}
          disabled={disabled}
        >
          {text}
        </Button>
        {cancelButton && (
          <Button
            type="secondary"
            className="reorder-button"
            size="small"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </Space>
    </Row>
  );
};

export default AddMoveButton;
