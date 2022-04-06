import React from "react";
import { Modal } from "antd";

const SaveFormDataModal = ({ visible, onOk, onCancel }) => {
  return (
    <Modal
      title="Save Form Data"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      destroyOnClose
    >
      <p>
        Please make sure that the data has been saved before you navigate away
        from the page.
        <br />
        To save the data please click on the &quot;Save&quot; button in the
        questionnaire.
        <br />
        Do you want to navigate away from the page?
      </p>
      <p>Click &quot;Yes&quot; if you have already saved the data</p>
      <p>Click &quot;No&quot; if you have not saved the data</p>
    </Modal>
  );
};

export default SaveFormDataModal;
