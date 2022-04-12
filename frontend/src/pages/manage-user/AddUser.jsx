import React, { useState } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  notification,
} from "antd";
import { api, store } from "../../lib";

const { Title } = Typography;

const roles = [
  { label: "Secretariat Admin", value: "secretariat_admin" },
  { label: "Member Admin", value: "member_admin" },
  { label: "Member User", value: "member_user" },
];

const AddUser = ({
  publishedForm,
  isAddUserVisible,
  setIsAddUserVisible,
  setReload,
  reload,
}) => {
  const [sending, setSending] = useState(false);
  const [form] = Form.useForm();
  const { optionValues } = store.useState((s) => s);
  const { organisation } = optionValues;

  const onFinish = (values) => {
    setSending(true);
    const { first_name, last_name } = values;
    values = { ...values, name: `${first_name} ${last_name}` };
    api
      .post("/user/register", values)
      .then(() => {
        notification.success({
          message: "User has been successfully added",
          description:
            "The User will receive an email with an activation link they must click as a final step in the process.",
        });
        setSending(false);
        setIsAddUserVisible(false);
        setReload(reload + 1);
      })
      .catch(() => {
        setSending(false);
        notification.error({
          message: "An error occurred",
          description: "Internal Server Error",
        });
      });
  };

  return (
    <Modal
      forceRender={true}
      title={<Title level={4}>New User</Title>}
      visible={isAddUserVisible}
      footer={
        <Space>
          <Button onClick={() => setIsAddUserVisible(false)}>Cancel</Button>
          <Button
            type="primary"
            ghost
            onClick={() => form.submit()}
            loading={sending}
          >
            Add User
          </Button>
        </Space>
      }
      width={840}
      onCancel={() => setIsAddUserVisible(false)}
      centered
    >
      <Form
        form={form}
        name="account-detail"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={(values, errorFields) =>
          console.info(values, errorFields)
        }
      >
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: "Please input first name" }]}
            >
              <Input className="bg-grey" placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: "Please input last name" }]}
            >
              <Input className="bg-grey" placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Please input email" }]}
            >
              <Input className="bg-grey" placeholder="Email address" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[{ required: true, message: "Please input email" }]}
            >
              <InputNumber className="bg-grey" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Role"
                options={roles}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="organisation"
              label="Organisation"
              rules={[
                { required: true, message: "Please select organization" },
              ]}
            >
              <Select
                showSearch
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Organization"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={organisation?.map((o) => ({
                  label: o.name.toUpperCase(),
                  value: o.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Form.Item name="questionnaires" label="Questionnaire Access">
              <Select
                showArrow
                showSearch
                allowClear
                mode="multiple"
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Questionnaire Access"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={publishedForm}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddUser;
