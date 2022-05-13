import React, { useState, useMemo } from "react";
import { Row, Col, Modal, Button, Checkbox, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";

const DataSecurityModal = ({ visible, onOk, onCancel, force = true }) => {
  const [checkboxOne, setCheckboxOne] = useState(false);
  const [checkboxTwo, setCheckboxTwo] = useState(false);
  const [checkboxThree, setCheckboxThree] = useState(false);
  const [checkboxFour, setCheckboxFour] = useState(false);

  const disableOkBtn = useMemo(() => {
    return force
      ? checkboxOne && checkboxTwo && checkboxThree && checkboxFour
      : checkboxFour;
  }, [force, checkboxOne, checkboxTwo, checkboxThree, checkboxFour]);

  return (
    <Modal
      title=""
      visible={visible}
      centered
      width="600px"
      onCancel={onCancel}
      destroyOnClose
      footer={
        <Row align="middle" justify="center">
          <Button type="primary" onClick={onOk} disabled={!disableOkBtn}>
            {force ? "Agree and Continue" : "Yes"}
          </Button>
          <Button onClick={onCancel}>{force ? "Cancel" : "No"}</Button>
        </Row>
      }
    >
      <Row align="middle" justify="center">
        <WarningOutlined
          style={{ fontSize: "100px", color: "#F9CFA8", marginBottom: "24px" }}
        />
        <Space direction="vertical" size="large">
          {force && (
            <>
              <Row align="top" justify="space-between" gutter={[24, 24]}>
                <Col span={1}>
                  <Checkbox
                    checked={checkboxOne}
                    onChange={(val) => setCheckboxOne(val.target.checked)}
                  />
                </Col>
                <Col span={23} style={{ fontSize: "1rem" }}>
                  I have checked and tried to complete all mandatory fields that
                  are marked as still to be completed.
                </Col>
              </Row>
              <Row align="top" justify="space-between" gutter={[24, 24]}>
                <Col span={1}>
                  <Checkbox
                    checked={checkboxTwo}
                    onChange={(val) => setCheckboxTwo(val.target.checked)}
                  />
                </Col>
                <Col span={23} style={{ fontSize: "1rem" }}>
                  I have used comments boxes in the corresponding question to
                  explain why I cannot complete the still uncompleted mandatory
                  fields.
                </Col>
              </Row>
              <Row align="top" justify="space-between" gutter={[24, 24]}>
                <Col span={1}>
                  <Checkbox
                    checked={checkboxThree}
                    onChange={(val) => setCheckboxThree(val.target.checked)}
                  />
                </Col>
                <Col span={23} style={{ fontSize: "1rem" }}>
                  I have used above comments box to provide any relevant
                  additional information on the not completed mandatory field.
                </Col>
              </Row>
            </>
          )}
          <Row align="top" justify="space-between" gutter={[24, 24]}>
            <Col span={1}>
              <Checkbox
                checked={checkboxFour}
                onChange={(val) => setCheckboxFour(val.target.checked)}
              />
            </Col>
            <Col span={23} style={{ fontSize: "1rem" }}>
              After submitting your data, you will not be able to change it
              anymore. If you are still working on your submission for this
              round of data collection, please use “Save”. Are you sure you want
              to “Submit”?
            </Col>
          </Row>
        </Space>
      </Row>
    </Modal>
  );
};

export default DataSecurityModal;
