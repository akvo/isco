import React from "react";
import { Modal } from "antd";
import { uiText } from "../../static";

const SaveFormDataModal = ({ visible, onOk, onCancel, activeLang }) => {
  // this modal shows when user navigate away from survey
  // to confirm that user has save/submit the survey
  const text = uiText[activeLang];

  return (
    <Modal
      title={text.modalSaveForm}
      open={visible}
      onOk={onOk}
      okText={text.btnSave}
      onCancel={onCancel}
      cancelText={text.btnDontSave}
      centered
      destroyOnClose
      maskClosable={false}
    >
      <p>{text.valClickSave}</p>
    </Modal>
  );
};

export default SaveFormDataModal;
