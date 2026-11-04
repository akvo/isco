import React, { useState, useEffect } from "react";
import { Modal, Select, Form, Typography, Space, Button, message } from "antd";
import { api, store } from "../../lib";

const { Text } = Typography;

const EditPeerGroupMappingModal = ({
  visible,
  peerGroup,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { optionValues } = store.useState((s) => s);
  const allMemberTypes = (optionValues?.member_type || []).filter(
    (m) => m.name !== "All"
  );

  useEffect(() => {
    if (visible && peerGroup) {
      const currentIds = (peerGroup.member_types || []).map((m) => m.id);
      form.setFieldsValue({
        member_type_ids: currentIds,
      });
    }
  }, [visible, peerGroup, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await api.put(`/peer_group/${peerGroup.id}/mappings`, {
        member_type_ids: values.member_type_ids || [],
      });
      message.success(`Successfully updated mappings for ${peerGroup.name}`);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      const errorMsg =
        err?.response?.data?.detail || "Failed to update peer group mappings";
      message.error(errorMsg);
    }
  };

  const handleSelectAll = () => {
    form.setFieldsValue({
      member_type_ids: allMemberTypes.map((m) => m.id),
    });
  };

  const handleClearAll = () => {
    form.setFieldsValue({
      member_type_ids: [],
    });
  };

  return (
    <Modal
      title={`Edit Member Types: ${peerGroup?.name || ""}`}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      destroyOnClose
      okText="Save Mappings"
      cancelText="Cancel"
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Select which member type tags should map to this harmonized cohort.
          Organizations with these member types will automatically inherit this
          peer group.
        </Text>
      </div>

      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Space>
          <Button size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={handleClearAll}>
            Clear All
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item name="member_type_ids" label="Mapped Member Types">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select member types"
            style={{ width: "100%" }}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {allMemberTypes.map((mt) => (
              <Select.Option key={mt.id} value={mt.id}>
                {mt.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPeerGroupMappingModal;
