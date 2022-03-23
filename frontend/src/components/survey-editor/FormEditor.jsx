import React from "react";
import "./style.scss";
import { Row, Col, Form, Input, Select, Button } from "antd";
import { store } from "../../lib";

const FormEditor = ({
  form,
  showSaveButton = false,
  saveButtonLoading = false,
}) => {
  const optionValues = store.useState((s) => s?.optionValues);
  const { languages } = optionValues;

  return (
    <Row className="form-editor-wrapper">
      <Col span={24}>
        <div className="field-wrapper">
          <div className="field-label">Survey Name</div>
          <Form.Item
            name="form-name"
            rules={[{ required: true, message: "Please input survey name" }]}
          >
            <Input className="bg-grey" placeholder="Survey Name" />
          </Form.Item>
        </div>
        <div className="field-wrapper">
          <div className="field-label">Survey Description</div>
          <Form.Item name="form-description">
            <Input.TextArea
              className="bg-grey"
              placeholder="Survey Description"
              rows={3}
            />
          </Form.Item>
        </div>
        <div className="field-wrapper">
          <div className="field-label">Languages</div>
          <Form.Item name="form-languages">
            <Select
              mode="multiple"
              showSearch={true}
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Languages"
              options={languages?.map((lang) => ({
                label: lang?.name,
                value: lang?.code,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Form.Item>
        </div>
        {showSaveButton && (
          <Button
            type="primary"
            ghost
            onClick={() => form.submit()}
            loading={saveButtonLoading}
          >
            Save
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default FormEditor;
