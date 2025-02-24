import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Form, Input, Select, Switch, Button, Space } from "antd";
import { store } from "../../lib";
import { globalMultipleSelectProps } from "../../lib/util";

const FormEditor = ({
  form,
  enable_prefilled_value = false,
  showSaveButton = false,
  saveButtonLoading = false,
}) => {
  const optionValues = store.useState((s) => s?.optionValues);
  const { languages } = optionValues;
  // filter en from languages list, because that the default value
  const filterLangs = languages
    ?.filter((l) => l.code !== "en")
    ?.map((lang) => ({
      label: lang?.name,
      value: lang?.code,
    }));
  // enable_prefilled_value
  const [enablePrefilledValue, setEnablePrefilledValue] = useState(false);

  useEffect(() => {
    setEnablePrefilledValue(enable_prefilled_value);
  }, [enable_prefilled_value]);

  return (
    <Row>
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
              options={filterLangs}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              {...globalMultipleSelectProps}
            />
          </Form.Item>
        </div>
        <div className="field-wrapper" style={{ marginBottom: "24px" }}>
          <Space align="center">
            <Form.Item name="form-enable_prefilled_value" style={{ margin: 0 }}>
              <Switch
                onChange={setEnablePrefilledValue}
                checked={enablePrefilledValue}
              />
            </Form.Item>
            <span className="field-label">Enable Prefilled Value</span>
          </Space>
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
