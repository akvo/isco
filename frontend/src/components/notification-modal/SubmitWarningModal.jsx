import React, { useState, useMemo } from "react";
import { Row, Col, Modal, Button, Checkbox, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { uiText } from "../../static";
import { store } from "../../lib";

const SubmitWarningModal = ({
  visible,
  onOk,
  onCancel,
  btnLoading = false,
  force = true,
  save = false,
  mismatch = false,
}) => {
  const [checkboxOne, setCheckboxOne] = useState(false);
  const [checkboxTwo, setCheckboxTwo] = useState(false);
  const [checkboxThree, setCheckboxThree] = useState(false);
  const checkboxFour = true;

  const { active: activeLang } = store.useState((s) => s.language);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const disableOkBtn = useMemo(() => {
    return force
      ? checkboxOne && checkboxTwo && checkboxThree && checkboxFour
      : save
      ? checkboxFour
      : checkboxThree && checkboxFour;
  }, [force, save, checkboxOne, checkboxTwo, checkboxThree, checkboxFour]);

  return (
    <Modal
      title=""
      open={visible}
      centered
      width="600px"
      onCancel={onCancel}
      destroyOnClose
      footer={
        <Row align="middle" justify="center">
          {!mismatch && (
            <Button
              type="primary"
              onClick={onOk}
              disabled={!disableOkBtn}
              loading={btnLoading}
            >
              {force ? text.btnAgreeContinue : text.btnYes}
            </Button>
          )}
          <Button onClick={onCancel}>
            {force ? text.btnCancel : save ? text.btnNo : text.btnClose}
          </Button>
        </Row>
      }
      maskClosable={false}
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
                  {text.submitModalC1}
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
                  {text.submitModalC2}
                </Col>
              </Row>
            </>
          )}
          {!save && !mismatch && (
            <Row align="top" justify="space-between" gutter={[24, 24]}>
              <Col span={1}>
                <Checkbox
                  checked={checkboxThree}
                  onChange={(val) => setCheckboxThree(val.target.checked)}
                />
              </Col>
              <Col span={23} style={{ fontSize: "1rem" }}>
                {text.submitModalC3}
              </Col>
            </Row>
          )}
          {save && (
            <Row align="top" justify="space-between" gutter={[24, 24]}>
              <Col span={24} style={{ fontSize: "1rem" }}>
                {text.submitModalC4}
              </Col>
            </Row>
          )}
          {!save && mismatch && (
            <Row align="top" justify="space-between" gutter={[24, 24]}>
              <Col span={24} style={{ fontSize: "1rem" }}>
                {text.prefilledMismatchWarming}
              </Col>
            </Row>
          )}
        </Space>
      </Row>
    </Modal>
  );
};

export default SubmitWarningModal;
