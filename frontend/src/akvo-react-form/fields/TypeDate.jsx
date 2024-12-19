import React, { useEffect, useCallback, useMemo } from "react";
import { Form, DatePicker } from "antd";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import moment from "moment";

const DateField = ({ id, keyform, required, rules, uiText, onChange }) => (
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
      onChange={onChange}
    />
  </Form.Item>
);

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
  show_repeat_as_table,
  repeats,
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

  const handleDatePickerChange = useCallback(
    (val) => {
      updateDataPointName(val);
    },
    [updateDataPointName]
  );

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <DateField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            uiText={uiText}
            onChange={handleDatePickerChange}
          />
        ),
      };
    });
  }, [handleDatePickerChange, id, keyform, repeats, required, rules, uiText]);

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

      {/* Show as repeat inputs or not */}
      {show_repeat_as_table ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <DateField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          uiText={uiText}
          onChange={handleDatePickerChange}
        />
      )}

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeDate;
