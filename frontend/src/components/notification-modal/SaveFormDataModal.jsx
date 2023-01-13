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
      visible={visible}
      onOk={onOk}
      okText={text.btnYes}
      onCancel={onCancel}
      cancelText={text.btnNo}
      centered
      destroyOnClose
    >
      <p>{text.valClickSave}</p>
      <p>{text.valClickYes}</p>
      <p>{text.valClickNo}</p>
    </Modal>
  );
};

export default SaveFormDataModal;
