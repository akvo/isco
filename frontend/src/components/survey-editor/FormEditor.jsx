import React from "react";
import "./style.scss";
import { Row, Col, Form, Input, Select } from "antd";

const FormEditor = ({ form }) => {
  return (
    <Row className="form-editor-wrapper">
      <Col span={24}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Please input survey name" }]}
        >
          <Input className="bg-grey" placeholder="Survey Name" />
        </Form.Item>
        <Form.Item name="description">
          <Input.TextArea
            className="bg-grey"
            placeholder="Survey Description"
            rows={3}
          />
        </Form.Item>
        <Form.Item name="languages">
          <Select
            className="custom-dropdown-wrapper bg-grey"
            placeholder="Languages"
            options={[]}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default FormEditor;
