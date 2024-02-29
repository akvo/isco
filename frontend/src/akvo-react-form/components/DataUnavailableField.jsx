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
    <Form.Item key={`na_${keyform}`} name={`na_${id}`} noStyle>
      <Checkbox
        id={`na_${id}`}
        checked={naChecked}
        onChange={(e) => {
          setNaChecked(e.target.checked);
        }}
        style={{ marginTop: "8px" }}
      >
        {text.inputDataUnavailable}
      </Checkbox>
    </Form.Item>
  );
};

export default DataUnavailableField;
