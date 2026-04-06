import React, { useState, useEffect, useMemo } from "react";
import { Form, Checkbox } from "antd";
import uiText from "../../static/ui-text";
import { store } from "../../lib";

const DataUnavailableField = ({
  allowNA,
  coreMandatory,
  keyform,
  id,
  naChecked,
  setNaChecked,
  show_repeat_in_question_level,
  disabled = false,
}) => {
  const form = Form.useFormInstance();
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;
  const [showConflictError, setShowConflictError] = useState(false);

  const fieldName = `dataNA_${id}`;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  useEffect(() => {
    form.setFieldValue(fieldName, naChecked);
  }, [fieldName, naChecked, form]);

  if (!allowNA || coreMandatory) {
    return "";
  }

  return (
    <>
      <Form.Item
        key={`dataNA_${keyform}`}
        name={fieldName}
        valuePropName="checked"
        noStyle
      >
        <Checkbox
          id={`dataNA_${id}`}
          checked={naChecked}
          onChange={(e) => {
            const isChecked = e.target.checked;
            const currentValue = form.getFieldValue([id]);

            if (isChecked && (currentValue || currentValue === 0)) {
              setShowConflictError(true);
              setTimeout(() => {
                setShowConflictError(false);
              }, 5000);
              // Form.Item intercepts onChange and updates its own state.
              // We must manually overwrite it to revert the visual checkmark.
              setTimeout(() => {
                form.setFieldValue(fieldName, false);
              }, 0);
              return;
            }

            setShowConflictError(false);
            setNaChecked(isChecked);
            setTimeout(() => form.validateFields([id]).catch(() => {}), 0);
          }}
          style={show_repeat_in_question_level ? {} : { marginTop: "8px" }}
          disabled={disabled}
        >
          {text.inputDataUnavailable}
        </Checkbox>
      </Form.Item>
      {showConflictError && (
        <div
          style={{
            color: "#ff4d4f",
            fontSize: "14px",
            marginTop: "5px",
            animation: "fadeIn 0.3s",
          }}
        >
          {text.errorDataUnavailableConflict}
        </div>
      )}
    </>
  );
};

export default DataUnavailableField;
