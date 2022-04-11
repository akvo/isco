import React from "react";
import { Modal, Button } from "antd";
import { dataSecurityContent } from "../../static";

const DataSecurityModal = ({ visible, onCancel, activeLang }) => {
  return (
    <Modal
      title={<h3>Data Security Provisions</h3>}
      visible={visible}
      onCancel={onCancel}
      centered
      destroyOnClose
      okText=""
      cancelText="Cancel"
      width="1000px"
      className="data-security-modal-wrapper"
      footer={<Button onClick={onCancel}>Cancel</Button>}
    >
      {dataSecurityContent[activeLang]}
    </Modal>
  );
};

export default DataSecurityModal;
