import React, { useState, useEffect } from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  notification,
} from "antd";
import { api, store } from "../../lib";
import { globalMultipleSelectProps } from "../../lib/util";

const { Title } = Typography;
const { Option } = Select;

const AddMember = ({
  isAddMemberVisible,
  setIsAddMemberVisible,
  setReload,
  reload,
  selectedMember,
  setSelectedMember,
}) => {
  const [sending, setSending] = useState(false);
  const [form] = Form.useForm();
  const { optionValues } = store.useState((s) => s);
  const { member_type, isco_type } = optionValues;
  const memberType = member_type.filter((isco) => isco.name !== "All");

  const iscoType = isco_type.filter((isco) => isco.name !== "All");

  const isAdd = !selectedMember;
  const requiredFields = isAdd ? true : false;
  const modalTitle = isAdd ? "New Member" : "Update Member";
  const buttonOkText = isAdd ? "Add Member" : "Update Member";

  // set initial form values
  useEffect(() => {
    if (!selectedMember) {
      form.setFieldsValue({ name: "" });
      form.setFieldsValue({ member_type: [] });
      form.setFieldsValue({ isco_type: [] });
    }
    if (selectedMember?.id) {
      const { name, member_type, isco_type } = selectedMember;
      form.setFieldsValue({ name: name });
      form.setFieldsValue({ member_type: member_type });
      form.setFieldsValue({ isco_type: isco_type });
    }
  }, [selectedMember, form]);

  const handleOnClickModalCancel = () => {
    form.resetFields();
    setIsAddMemberVisible(false);
    setSelectedMember(null);
  };

  const onFinish = (values) => {
    const { name, member_type, isco_type } = values;
    const payload = {
      code: "1",
      name: name,
      active: true,
      member_type: member_type,
      isco_type: isco_type,
    };
    setSending(true);
    if (!selectedMember) {
      api
        .post("/organisation", payload)
        .then(() => {
          notification.success({
            message: "Success",
            description: "Member has been successfully added.",
          });
          setSending(false);
          setIsAddMemberVisible(false);
          setReload(reload + 1);
          form.resetFields();
        })
        .catch(() => {
          setSending(false);
          notification.error({
            message: "An error occurred",
            description: "Internal Server Error",
          });
        });
    }
    if (selectedMember?.id) {
      // UPDATE
      const url = `/organisation/${selectedMember.id}`;
      api
        .put(url, payload)
        .then(() => {
          notification.success({
            message: "Success",
            description: "Member has been successfully updated.",
          });
          setSending(false);
          setIsAddMemberVisible(false);
          setReload(reload + 1);
          form.resetFields();
        })
        .catch(() => {
          setSending(false);
          notification.error({
            message: "An error occurred",
            description: "Internal Server Error",
          });
        });
    }
  };

  const options = (data) => {
    const rendering = data.map((v) => {
      return (
        <Option value={v.id} key={v.id}>
          {v.name}
        </Option>
      );
    });
    return rendering;
  };

  return (
    <Modal
      destroyOnClose={true}
      title={<Title level={4}>{modalTitle}</Title>}
      visible={isAddMemberVisible}
      footer={
        <Space>
          <Button onClick={handleOnClickModalCancel}>Cancel</Button>
          <Button
            type="primary"
            ghost
            onClick={() => {
              form.submit();
            }}
            loading={sending}
          >
            {buttonOkText}
          </Button>
        </Space>
      }
      width={840}
      onCancel={() => setIsAddMemberVisible(false)}
      centered
      maskClosable={false}
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
          <Col span={24}>
            <Form.Item
              name="name"
              label="Member name"
              rules={[
                {
                  required: requiredFields,
                  message: "Please input first name",
                },
              ]}
            >
              <Input className="bg-grey" placeholder="Name" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Form.Item
              name="member_type"
              label="Member Type"
              rules={[
                {
                  required: requiredFields,
                  message: "Please select a member type",
                },
              ]}
            >
              <Select
                showArrow
                showSearch
                mode="multiple"
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Member Type"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                {...globalMultipleSelectProps}
              >
                {options(memberType)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Form.Item
              name="isco_type"
              label="ISCO"
              rules={[
                {
                  required: requiredFields,
                  message: "Please select an ISCO type",
                },
              ]}
            >
              <Select
                showArrow
                showSearch
                mode="multiple"
                className="custom-dropdown-wrapper bg-grey"
                placeholder="ISCO"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                {...globalMultipleSelectProps}
              >
                {options(iscoType)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddMember;
