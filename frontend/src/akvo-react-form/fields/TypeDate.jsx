import React, { useEffect, useCallback } from "react";
import { Form, DatePicker } from "antd";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import moment from "moment";

const TypeDate = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  meta,
  requiredSign,
  uiText,
}) => {
  const form = Form.useFormInstance();
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
                  value: moment(value).format("YYYY-MM-DD"),
                }
              : g
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

  const handleDatePickerChange = (val) => {
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
        <DatePicker
          getPopupContainer={(trigger) => trigger.parentNode}
          placeholder={uiText.selectDate}
          format="YYYY-MM-DD"
          onFocus={(e) => (e.target.readOnly = true)}
          style={{ width: "100%" }}
          onChange={handleDatePickerChange}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeDate;
