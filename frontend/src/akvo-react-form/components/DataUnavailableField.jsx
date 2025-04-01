import React, { useMemo } from "react";
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
}) => {
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  if (!allowNA || coreMandatory) {
    return "";
  }

  return (
    <Form.Item
      key={`dataNA_${keyform}`}
      name={`dataNA_${id}`}
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
      >
        {text.inputDataUnavailable}
      </Checkbox>
    </Form.Item>
  );
};

export default DataUnavailableField;
