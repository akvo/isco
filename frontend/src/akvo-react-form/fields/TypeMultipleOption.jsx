import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Divider, Form, Select, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";
import { globalMultipleSelectProps } from "../../lib/util";

const MultipleOptionField = ({
  id,
  keyform,
  required,
  rules,
  allowOther,
  allowOtherText,
  uiText,
  is_repeat_identifier,
  dependency,
  show_repeat_in_question_level,
  repeat,
  extra,
  option,
  meta,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [extraOption, setExtraOption] = useState([]);
  const addNewOption = useCallback(
    (e) => {
      setExtraOption((prev) => [
        ...prev,
        { name: newOption, label: newOption },
      ]);
      e.preventDefault();
      setNewOption("");
    },
    [setExtraOption, setNewOption, newOption]
  );
  const onNewOptionChange = useCallback(
    (event) => {
      setNewOption(event.target.value);
    },
    [setNewOption]
  );

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
        name={disableFieldByDependency ? "" : id}
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
          onChange={onChange}
          disabled={is_repeat_identifier || disableFieldByDependency} // handle leading_question -> is_repeat_identifier
          {...globalMultipleSelectProps}
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
    </div>
  );
};

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
  is_repeat_identifier,
  show_repeat_in_question_level,
  repeats,
  dependency,
}) => {
  const form = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    formRef: form,
    show_repeat_in_question_level,
    dependency,
    repeats,
  });
  // eol show/hide fields

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level || hideFields) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        is_repeat_identifier: is_repeat_identifier,
        field: (
          <MultipleOptionField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            allowOther={allowOther}
            allowOtherText={allowOtherText}
            uiText={uiText}
            is_repeat_identifier={is_repeat_identifier}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            option={option}
            extra={extra}
            meta={meta}
          />
        ),
      };
    });
  }, [
    hideFields,
    id,
    keyform,
    required,
    rules,
    allowOther,
    allowOtherText,
    uiText,
    is_repeat_identifier,
    repeats,
    show_repeat_in_question_level,
    dependency,
    option,
    extra,
    meta,
  ]);

  if (hideFields) {
    return null;
  }

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
        <MultipleOptionField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          allowOther={allowOther}
          allowOtherText={allowOtherText}
          uiText={uiText}
          is_repeat_identifier={is_repeat_identifier}
          option={option}
          extra={extra}
          meta={meta}
        />
      )}
    </Form.Item>
  );
};
export default TypeMultipleOption;
