import React, { useState, useMemo } from "react";
import { Row, Col, Modal, Button, Checkbox, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";

const DataSecurityModal = ({ visible, onOk, onCancel }) => {
  const [checkboxOne, setCheckboxOne] = useState(false);
  const [checkboxTwo, setCheckboxTwo] = useState(false);
  const [checkboxThree, setCheckboxThree] = useState(false);

  const disableOkBtn = useMemo(() => {
    return checkboxOne && checkboxTwo && checkboxThree;
  }, [checkboxOne, checkboxTwo, checkboxThree]);

  return (
    <Modal
      title=""
      visible={visible}
      centered
      destroyOnClose
      footer={
        <Row align="middle" justify="center">
          <Button type="primary" onClick={onOk} disabled={!disableOkBtn}>
            Agree and Continue
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Row>
      }
    >
      <Row align="middle" justify="center">
        <WarningOutlined
          style={{ fontSize: "100px", color: "#F9CFA8", marginBottom: "12px" }}
        />
        <Space direction="vertical">
          <Row align="top" justify="space-between" gutter={[15, 15]}>
            <Col span={1}>
              <Checkbox
                checked={checkboxOne}
                onChange={(val) => setCheckboxOne(val.target.checked)}
              />
            </Col>
            <Col span={23} style={{ fontSize: "1rem" }}>
              I have checked and tried to complete all mandatory fields that are
              marked as still to be completed.
            </Col>
          </Row>
          <Row align="top" justify="space-between" gutter={[15, 15]}>
            <Col span={1}>
              <Checkbox
                checked={checkboxTwo}
                onChange={(val) => setCheckboxTwo(val.target.checked)}
              />
            </Col>
            <Col span={23} style={{ fontSize: "1rem" }}>
              I have used comments boxes in the corresponding question group to
              explain why I cannot complete the still uncompleted mandatory
              fields.
            </Col>
          </Row>
          <Row align="top" justify="space-between" gutter={[15, 15]}>
            <Col span={1}>
              <Checkbox
                checked={checkboxThree}
                onChange={(val) => setCheckboxThree(val.target.checked)}
              />
            </Col>
            <Col span={23} style={{ fontSize: "1rem" }}>
              I have used above comments box to provide any relevant additional
              information on the not completed mandatory field.
            </Col>
          </Row>
        </Space>
      </Row>
    </Modal>
  );
};

export default DataSecurityModal;
