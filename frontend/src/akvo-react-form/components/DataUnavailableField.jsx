import React, { useEffect, useMemo } from "react";
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
          setNaChecked(e.target.checked);
        }}
        style={show_repeat_in_question_level ? {} : { marginTop: "8px" }}
        disabled={disabled}
      >
        {text.inputDataUnavailable}
      </Checkbox>
    </Form.Item>
  );
};

export default DataUnavailableField;
