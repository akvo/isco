import React, { useState } from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Extra, FieldLabel } from "../support";
import { DataUnavailableField } from "../components";

const TypeText = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  requiredSign,
  coreMandatory,
  uiText,
  rule,
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const [naChecked, setNaChecked] = useState(false);

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
        <TextArea row={4} disabled={naChecked} />
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
export default TypeText;
