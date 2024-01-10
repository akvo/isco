import React from "react";
import { InboxOutlined } from "@ant-design/icons";

const DraggerText = ({ uiText, limit = 2 }) => {
  return (
    <React.Fragment>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{uiText.dragFileToUpload}</p>
      <p className="ant-upload-hint">{`${uiText.fileUploadOnlySupport} ${limit} MB.`}</p>
    </React.Fragment>
  );
};

export default DraggerText;
