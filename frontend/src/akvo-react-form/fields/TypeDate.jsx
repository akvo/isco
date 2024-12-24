import React, { useEffect, useCallback, useMemo } from "react";
import { Form, DatePicker } from "antd";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import moment from "moment";
import { validateDisableDependencyQuestionInRepeatQuestionLevel } from "../lib";

const DateField = ({
  id,
  keyform,
  required,
  rules,
  uiText,
  show_repeat_in_question_level,
  dependency,
  repeat,
  extra,
  meta,
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

  const onChange = useCallback(
    (val) => {
      updateDataPointName(val);
    },
    [updateDataPointName]
  );

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      formRef: form,
      show_repeat_in_question_level,
      dependency,
      repeat,
    });

  return (
    <div>
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
          onChange={onChange}
          disabled={disableFieldByDependency}
        />
      </Form.Item>

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

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
  show_repeat_in_question_level,
  repeats,
  dependency,
}) => {
  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level) {
      return [];
    }
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
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            extra={extra}
            meta={meta}
          />
        ),
      };
    });
  }, [
    id,
    keyform,
    repeats,
    required,
    rules,
    uiText,
    show_repeat_in_question_level,
    dependency,
    extra,
    meta,
  ]);

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
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <DateField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          uiText={uiText}
          extra={extra}
          meta={meta}
        />
      )}
    </Form.Item>
  );
};
export default TypeDate;
