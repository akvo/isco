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
  const isLeadingQuestion = group?.leading_question;

  const repeatTitlePrefix = () => {
    if (!isLeadingQuestion) {
      return ` - ${repeat + 1}`;
    }
    if (isLeadingQuestion && repeat) {
      return ` - ${repeat}`;
    }
    return "";
  };

  return (
    <div className="arf-repeat-title">
      <Row justify="space-between" align="middle">
        <Col span={!isLeadingQuestion ? 20 : 24} align="start">
          {group?.name}
          {repeatTitlePrefix()}
        </Col>
        {!isLeadingQuestion && (
          <Col span={4} align="end">
            <DeleteSelectedRepeatButton
              index={index}
              group={group}
              repeat={repeat}
              updateRepeat={updateRepeat}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default RepeatTitle;
