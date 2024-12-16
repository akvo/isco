import React from "react";
import { Row, Col, Button, Input, Space } from "antd";
import { MdRepeat } from "react-icons/md";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const FieldGroupHeader = ({ group, index, updateRepeat }) => {
  const heading = group.name || `Section ${index + 1}`;
  const repeat = group?.repeat;
  const repeatText = group?.repeatText || `Number of ${heading}`;
  const repeatButtonPlacement = group?.repeatButtonPlacement;
  const isLeadingQuestion = group?.leading_question;

  if (!group?.repeatable) {
    return <div className="arf-field-group-header">{heading}</div>;
  }
  return (
    <div className="arf-field-group-header">
      <Space>
        {heading}
        <MdRepeat />
      </Space>
      {(!repeatButtonPlacement || repeatButtonPlacement === "top") &&
        !isLeadingQuestion && (
          <Row align="middle">
            <Col span={24} className="arf-repeat-input">
              <div className="arf-field-title">{repeatText}</div>
              <Input.Group compact size="small" className="arf-field">
                <Button
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => updateRepeat(index, repeat - 1, "delete")}
                  disabled={repeat < 2}
                  className={repeat < 2 ? "arf-disabled" : ""}
                />
                <Input
                  style={{
                    width: "40px",
                    textAlign: "center",
                    backgroundColor: "#fff",
                    border: "none",
                    color: "#6a6a6a",
                    padding: "2.5px",
                    fontWeight: "bold",
                    display: "inline-block",
                  }}
                  value={repeat}
                  disabled
                />
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => updateRepeat(index, repeat + 1, "add")}
                />
              </Input.Group>
            </Col>
          </Row>
        )}
    </div>
  );
};

export default FieldGroupHeader;
