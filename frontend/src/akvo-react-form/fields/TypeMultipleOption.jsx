import React, { useState, useEffect, useCallback } from "react";
import { Divider, Form, Select, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";

const TypeMultipleOption = ({
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
  const addNewOption = (e) => {
    setExtraOption([...extraOption, { name: newOption, label: newOption }]);
    e.preventDefault();
    setNewOption("");
  };
  const onNewOptionChange = (event) => {
    setNewOption(event.target.value);
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
                  value: value.join(" - "),
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue && currentValue?.length) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  useEffect(() => {
    setOptions([...option, ...extraOption]);
  }, [option, extraOption]);

  const handleChange = (val) => {
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
        rules={rules}
        required={required}
      >
        <Select
          style={{ width: "100%" }}
          mode="multiple"
          showArrow
          getPopupContainer={(trigger) => trigger.parentNode}
          onFocus={(e) => (e.target.readOnly = true)}
          placeholder={uiText.pleaseSelect}
          dropdownRender={(menu) =>
            allowOther ? (
              <div>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ padding: "0 8px 4px", width: "100%" }}>
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
              </div>
            ) : (
              menu
            )
          }
          allowClear
          onChange={handleChange}
        >
          {options.map((o, io) => (
            <Select.Option key={io} value={o.name}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeMultipleOption;
