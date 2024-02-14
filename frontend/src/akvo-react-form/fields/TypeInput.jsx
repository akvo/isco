import React, { useCallback, useEffect, useState } from "react";
import { Form, Input } from "antd";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import { InputFieldIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";

const TypeInput = ({
  id,
  name,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  requiredSign,
  fieldIcons = true,
  coreMandatory,
  uiText,
  rule,
}) => {
  const form = Form.useFormInstance();
  const [showPrefix, setShowPrefix] = useState(true);
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const currentValue = form.getFieldValue([id]);
  const [naChecked, setNaChecked] = useState(false);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id ? { ...g, value: value } : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  const onChange = (e) => {
    updateDataPointName(e.target.value);
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
          requiredSign={required ? requiredSign : null}
          fieldIcons={fieldIcons}
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
        rules={[
          ...rules,
          {
            validator: (_, value) => {
              const requiredErr = `${name.props.children[0]} ${uiText.errorIsRequired}`;
              if (value || value === 0) {
                return Promise.resolve();
              }
              if (!coreMandatory && naChecked) {
                return Promise.resolve();
              }
              if (!coreMandatory && !naChecked && required) {
                return Promise.reject(new Error(requiredErr));
              }
              return Promise.resolve();
            },
          },
        ]}
        required={coreMandatory ? required : !naChecked ? required : false}
      >
        <Input
          sytle={{ width: "100%" }}
          onBlur={() => {
            setShowPrefix(true);
          }}
          onFocus={() => setShowPrefix(false)}
          onChange={onChange}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          prefix={
            fieldIcons && showPrefix && !currentValue && <InputFieldIcon />
          }
          disabled={naChecked}
        />
      </Form.Item>

      {/* inputDataUnavailable */}
      <DataUnavailableField
        allowNA={rule?.allowNA}
        coreMandatory={coreMandatory}
        keyform={keyform}
        id={id}
        naChecked={naChecked}
        setNaChecked={setNaChecked}
      />

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeInput;
