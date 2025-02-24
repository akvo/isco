import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Space, Divider, Form, Radio, Select, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";
import { globalSelectProps } from "../../lib/util";

const OptionField = ({
  id,
  keyform,
  required,
  rules,
  allowOther,
  allowOtherText,
  uiText,
  is_repeat_identifier,
  show_repeat_in_question_level,
  dependency,
  repeat,
  extra,
  meta,
  option,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [extraOption, setExtraOption] = useState([]);
  // handle disable allowOther input field for radio button
  const [disableAllowOtherInputField, setDisableAllowOtherInputField] =
    useState(true);
  // handle other option input field on radio group
  const otherOptionDefInputName = `${id}-other-option`;
  const [otherOptionInputName, setOtherOptionInputName] = useState(
    otherOptionDefInputName
  );

  const isRadioGroup = useMemo(() => {
    if (show_repeat_in_question_level) {
      return false;
    }
    return options.length <= 3;
  }, [options, show_repeat_in_question_level]);

  const addNewOption = useCallback(
    (e) => {
      setExtraOption((prev) => [
        ...prev,
        { name: newOption, label: newOption },
      ]);
      e.preventDefault();
      setNewOption("");
    },
    [setExtraOption, newOption, setNewOption]
  );
  const onNewOptionChange = useCallback(
    (event) => {
      const value = event.target.value;
      setNewOption(value);
      if (allowOther && isRadioGroup) {
        form.setFieldsValue({ [id]: value });
      }
    },
    [setNewOption, allowOther, isRadioGroup, form, id]
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
                  value: value,
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

  useEffect(() => {
    setOptions([...option, ...extraOption]);
  }, [option, extraOption]);

  const onChange = useCallback(
    (val) => {
      // handle other option input value
      if (isRadioGroup && !show_repeat_in_question_level) {
        const value = val.target.value;
        // other option not selected
        setDisableAllowOtherInputField(true);
        setOtherOptionInputName(otherOptionDefInputName);
        form.setFieldsValue({ [otherOptionDefInputName]: newOption });
        if (allowOther && value === newOption) {
          // other option selected
          setDisableAllowOtherInputField(false);
          setOtherOptionInputName(id);
        }
        updateDataPointName(value);
        return;
      }
      updateDataPointName(val);
    },
    [
      allowOther,
      form,
      id,
      isRadioGroup,
      newOption,
      otherOptionDefInputName,
      updateDataPointName,
      show_repeat_in_question_level,
    ]
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
        rules={disableAllowOtherInputField && required ? rules : () => {}}
        required={disableAllowOtherInputField && required}
      >
        {isRadioGroup ? (
          <Radio.Group onChange={onChange}>
            <Space direction="vertical">
              {options.map((o, io) => (
                <Radio key={io} value={o.name}>
                  {o.label}
                </Radio>
              ))}
              {allowOther ? (
                <Radio value={newOption}>
                  <Form.Item
                    name={otherOptionInputName}
                    noStyle
                    rules={
                      !disableAllowOtherInputField && required
                        ? rules
                        : () => {}
                    }
                    required={!disableAllowOtherInputField && required}
                  >
                    <Input
                      placeholder={
                        allowOtherText || uiText.pleaseTypeOtherOption
                      }
                      value={newOption}
                      onChange={onNewOptionChange}
                      disabled={
                        disableAllowOtherInputField || is_repeat_identifier
                      } // handle leading_question -> is_repeat_identifier
                    />
                  </Form.Item>
                </Radio>
              ) : (
                ""
              )}
            </Space>
          </Radio.Group>
        ) : (
          <Select
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentNode}
            onFocus={(e) => (e.target.readOnly = true)}
            placeholder={uiText.pleaseSelect}
            dropdownRender={(menu) =>
              allowOther ? (
                <div>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
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
              ) : (
                menu
              )
            }
            showSearch
            filterOption
            optionFilterProp="children"
            onChange={onChange}
            disabled={is_repeat_identifier || disableFieldByDependency} // handle leading_question -> is_repeat_identifier
            {...globalSelectProps}
          >
            {options.map((o, io) => (
              <Select.Option key={io} value={o.name}>
                {o.label}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

const TypeOption = ({
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
          <OptionField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            allowOther={allowOther}
            allowOtherText={allowOtherText}
            uiText={uiText}
            is_repeat_identifier={is_repeat_identifier}
            dependency={dependency}
            show_repeat_in_question_level={show_repeat_in_question_level}
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
    extra,
    meta,
    option,
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
        <OptionField
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

export default TypeOption;
