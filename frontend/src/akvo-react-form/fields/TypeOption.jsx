import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Space, Divider, Form, Radio, Select, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";

const TypeOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra,
  meta,
  requiredSign,
  uiText,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [extraOption, setExtraOption] = useState([]);
  // handle disable allowOther input field for radio button
  const [disableAllowOtherInputField, setDisableAllowOtherInputField] =
    useState(true);
  // handle other option input field on radio group
  const otherOptionDefInputName = `${id}-other-option`;
  const [otherOptionInputName, setOtherOptionInputName] = useState(
    otherOptionDefInputName
  );
  const addNewOption = (e) => {
    setExtraOption([...extraOption, { name: newOption, label: newOption }]);
    e.preventDefault();
    setNewOption("");
  };
  const onNewOptionChange = (event) => {
    const value = event.target.value;
    setNewOption(value);
    if (allowOther && isRadioGroup) {
      form.setFieldsValue({ [id]: value });
    }
  };
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const currentValue = form.getFieldValue([id]);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: value,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  const isRadioGroup = useMemo(() => {
    return options.length <= 3;
  }, [options]);

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  useEffect(() => {
    setOptions([...option, ...extraOption]);
  }, [option, extraOption]);

  const handleChange = (val) => {
    // handle other option input value
    if (isRadioGroup) {
      const value = val.target.value;
      // other option not selected
      setDisableAllowOtherInputField(true);
      setOtherOptionInputName(otherOptionDefInputName);
      form.setFieldsValue({ [otherOptionDefInputName]: newOption });
      if (allowOther && value === newOption) {
        // other option selected
        setDisableAllowOtherInputField(false);
        setOtherOptionInputName(id);
      }
      updateDataPointName(value);
      return;
    }
    updateDataPointName(val);
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
          requiredSign={required ? requiredSign : null}
        />
      }
      tooltip={tooltip?.text}
      required={required}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={disableAllowOtherInputField && required ? rules : () => {}}
        required={disableAllowOtherInputField && required}
      >
        {isRadioGroup ? (
          <Radio.Group onChange={handleChange}>
            <Space direction="vertical">
              {options.map((o, io) => (
                <Radio key={io} value={o.name}>
                  {o.label}
                </Radio>
              ))}
              {allowOther ? (
                <Radio value={newOption}>
                  <Form.Item
                    name={otherOptionInputName}
                    noStyle
                    rules={
                      !disableAllowOtherInputField && required
                        ? rules
                        : () => {}
                    }
                    required={!disableAllowOtherInputField && required}
                  >
                    <Input
                      placeholder={
                        allowOtherText || uiText.pleaseTypeOtherOption
                      }
                      value={newOption}
                      onChange={onNewOptionChange}
                      disabled={disableAllowOtherInputField}
                    />
                  </Form.Item>
                </Radio>
              ) : (
                ""
              )}
            </Space>
          </Radio.Group>
        ) : (
          <Select
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentNode}
            onFocus={(e) => (e.target.readOnly = true)}
            placeholder={uiText.pleaseSelect}
            dropdownRender={(menu) =>
              allowOther ? (
                <div>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Input.Group compact>
                    <Button
                      type="primary"
                      onClick={addNewOption}
                      style={{ whiteSpace: "nowrap" }}
                      icon={<PlusOutlined />}
                      disabled={!newOption.length}
                    />
                    <Input
                      style={{ width: "calc(100% - 40px)", textAlign: "left" }}
                      placeholder={allowOtherText || uiText.pleaseEnterItem}
                      value={newOption}
                      onChange={onNewOptionChange}
                    />
                  </Input.Group>
                </div>
              ) : (
                menu
              )
            }
            allowClear
            showSearch
            filterOption
            optionFilterProp="children"
            onChange={handleChange}
          >
            {options.map((o, io) => (
              <Select.Option key={io} value={o.name}>
                {o.label}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};

export default TypeOption;
