import React from "react";
import { Modal, Button } from "antd";
import { dataSecurityContent } from "../../static";
import { uiText } from "../../static";

const DataSecurityModal = ({ visible, onCancel, activeLang }) => {
  const text = uiText[activeLang];
  return (
    <Modal
      title={<h3>{text.modalDataSecurity}</h3>}
      visible={visible}
      onCancel={onCancel}
      centered
      destroyOnClose
      width="1000px"
      className="data-security-modal-wrapper"
      footer={<Button onClick={onCancel}>{text.btnClose}</Button>}
    >
      {dataSecurityContent[activeLang]}
    </Modal>
  );
};

export default DataSecurityModal;
