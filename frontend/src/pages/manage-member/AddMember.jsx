import React, { useState, useEffect, useMemo } from "react";
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

  const [isAllMemberType, setIsAllMemberType] = useState(false);
  const [isAllIscoType, setIsAllIscoType] = useState(false);

  const isAdd = !selectedMember;
  const requiredFields = isAdd ? true : false;
  const modalTitle = isAdd ? "New Member" : "Update Member";
  const buttonOkText = isAdd ? "Add Member" : "Update Member";

  const memberType = useMemo(() => {
    if (!isAllMemberType) {
      return member_type;
    }
    return member_type.map((member) => {
      if (isAllMemberType && member.name !== "All") {
        return { ...member, disabled: true };
      }
      return {
        ...member,
        disabled: false,
      };
    });
  }, [isAllMemberType, member_type]);

  const iscoType = useMemo(() => {
    if (!isAllIscoType) {
      return isco_type;
    }
    return isco_type.map((isco) => {
      if (isAllIscoType && isco.name !== "All") {
        return { ...isco, disabled: true };
      }
      return {
        ...isco,
        disabled: false,
      };
    });
  }, [isAllIscoType, isco_type]);

  // set initial form values
  useEffect(() => {
    if (!selectedMember) {
      form.setFieldsValue({ name: "" });
      form.setFieldsValue({ member_type: [] });
      form.setFieldsValue({ isco_type: [] });
    }
    if (selectedMember?.id) {
      const {
        name,
        member_type: formMemberType,
        isco_type: formIscoType,
      } = selectedMember;
      form.setFieldsValue({ name: name });
      if (formMemberType.includes(1)) {
        setIsAllMemberType(true);
        form.setFieldsValue({
          member_type: formMemberType.filter((it) => it === 1),
        });
      } else {
        setIsAllMemberType(false);
        form.setFieldsValue({ member_type: formMemberType });
      }
      if (formIscoType.includes(1)) {
        setIsAllIscoType(true);
        form.setFieldsValue({
          isco_type: formIscoType.filter((it) => it === 1),
        });
      } else {
        setIsAllIscoType(false);
        form.setFieldsValue({ isco_type: formIscoType });
      }
    }
  }, [selectedMember, form]);

  const handleOnClickModalCancel = () => {
    setIsAllIscoType(false);
    setIsAllMemberType(false);
    form.resetFields();
    setIsAddMemberVisible(false);
    setSelectedMember(null);
  };

  const handleFormAddMemberOnChange = (currentValue) => {
    Object.entries(currentValue).forEach(([key, value]) => {
      // is all
      if (key === "member_type" && value.includes(1)) {
        setIsAllMemberType(true);
        form.setFieldValue("member_type", [1]);
      }
      if (key === "member_type" && !value.includes(1)) {
        setIsAllMemberType(false);
      }
      if (key === "isco_type" && value.includes(1)) {
        setIsAllIscoType(true);
        form.setFieldValue("isco_type", [1]);
      }
      if (key === "isco_type" && !value.includes(1)) {
        setIsAllIscoType(false);
      }
    });
  };

  const onFinish = (values) => {
    const allMemberTypeIds = member_type.map((it) => it.id);
    const allIscoTypeIds = isco_type.map((it) => it.id);

    // handle select all option
    const {
      name,
      member_type: formMemberType,
      isco_type: formIscoType,
    } = values;
    const memberTypePayload = formMemberType.includes(1)
      ? allMemberTypeIds
      : formMemberType;
    const iscoTypePayload = formIscoType.includes(1)
      ? allIscoTypeIds
      : formIscoType;
    // EOL handle select all option

    const payload = {
      code: "1",
      name: name,
      active: true,
      member_type: memberTypePayload,
      isco_type: iscoTypePayload,
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
          setIsAllIscoType(false);
          setIsAllMemberType(false);
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
          setIsAllIscoType(false);
          setIsAllMemberType(false);
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
        <Option value={v.id} key={v.id} disabled={v?.disabled || false}>
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
      onCancel={() => {
        setIsAddMemberVisible(false);
        setIsAllIscoType(false);
        setIsAllMemberType(false);
      }}
      centered
      maskClosable={false}
    >
      <Form
        form={form}
        name="account-detail"
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleFormAddMemberOnChange}
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
