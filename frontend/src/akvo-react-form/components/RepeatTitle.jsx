import React from "react";
import { MdDelete } from "react-icons/md";
import { Row, Col, Button } from "antd";

const DeleteSelectedRepeatButton = ({ index, group, repeat, updateRepeat }) => {
  if (group?.repeat <= 1) {
    return "";
  }
  return (
    <Button
      type="link"
      className="arf-repeat-delete-btn"
      icon={<MdDelete className="arf-icon" />}
      onClick={() =>
        updateRepeat(index, group?.repeat - 1, "delete-selected", repeat)
      }
    />
  );
};

const RepeatTitle = ({ index, group, repeat, updateRepeat }) => {
  return (
    <div className="arf-repeat-title">
      <Row justify="space-between" align="middle">
        <Col span={20} align="start">
          {group?.name}-{repeat + 1}
        </Col>
        <Col span={4} align="end">
          <DeleteSelectedRepeatButton
            index={index}
            group={group}
            repeat={repeat}
            updateRepeat={updateRepeat}
          />
        </Col>
      </Row>
    </div>
  );
};

export default RepeatTitle;
