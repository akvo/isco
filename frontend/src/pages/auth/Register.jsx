import React, { useMemo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button, Select } from "antd";
import Auth from "./Auth";
import { store } from "../../lib";
import { uiText } from "../../static";

const Register = () => {
  const [form] = Form.useForm();
  const optionValues = store.useState((s) => s?.optionValues);
  const iscoOption = optionValues?.isco_type?.map((i) => ({
    label: i?.name,
    value: i?.id,
  }));
  const organisationOption = optionValues?.organisation?.map((o) => ({
    label: o?.name,
    value: o?.id,
  }));

  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const handleRegisterOnFinish = (values) => {
    console.info(values);
  };

  return (
    <Auth>
      <Space direction="vertical" style={{ marginBottom: "12vh" }}>
        <Row align="bottom" justify="space-between" gutter={[12, 12]}>
          <Col span={8} align="start">
            <h2>{text.formRegister}</h2>
          </Col>
          <Col span={16} align="end">
            <p className="float-right">
              {text.formHaveAccount} <Link to="/login">{text.btnLogin}</Link>
            </p>
          </Col>
        </Row>
        <p className="data-security-provisions-doc-info">
          {text.infoDataSecurityDoc}
        </p>
        <Form
          form={form}
          className="form-wrapper"
          onFinish={handleRegisterOnFinish}
          scrollToFirstError
        >
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: text.valFullName }]}
          >
            <Input
              className="bg-grey"
              placeholder={text.formFullName}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: text.valEmail }]}
          >
            <Input
              className="bg-grey"
              placeholder={text.formEmail}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: text.valPwd }]}
          >
            <Input.Password
              className="bg-grey"
              placeholder={text.formPwd}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirm-password"
            rules={[
              {
                required: true,
                message: "Please input confirm your password.",
              },
            ]}
          >
            <Input.Password
              className="bg-grey"
              placeholder={text.formConfirmPwd}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Select
              size="large"
              className="bg-grey"
              placeholder={text.registerFilterOrganizationsBy}
              options={iscoOption}
            />
          </Form.Item>
          <Form.Item
            name="organisation"
            rules={[
              {
                required: true,
                message: text.valOrganization,
              },
            ]}
          >
            <Select
              className="bg-grey"
              size="large"
              placeholder={text.tbColOrganization}
              options={organisationOption}
            />
          </Form.Item>
          <Button
            type="primary"
            ghost
            block
            onClick={() => form.submit()}
            size="large"
          >
            {text.formRegister}
          </Button>
        </Form>
      </Space>
    </Auth>
  );
};

export default Register;
