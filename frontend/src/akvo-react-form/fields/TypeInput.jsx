import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import { InputFieldIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";
import {
  renderQuestionLabelForErrorMessage,
  containsUnavailableText,
} from "../lib";
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";

const InputField = ({
  id,
  name,
  keyform,
  required,
  rules,
  addonAfter,
  addonBefore,
  fieldIcons,
  coreMandatory,
  uiText,
  is_repeat_identifier,
  show_as_textarea,
  dependency,
  repeat,
  show_repeat_in_question_level,
  extra,
  rule,
  meta,
}) => {
  const form = Form.useFormInstance();
  const [naChecked, setNaChecked] = useState(false);
  const [showPrefix, setShowPrefix] = useState([]);

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
            g.id === id ? { ...g, value: value } : g
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
    // handle preload data unavailable checkbox
    if (!coreMandatory) {
      setTimeout(() => {
        // get parent extra component node by name
        const extraElName = `arf-extra-content-${id}`;
        const extraContent = document.getElementById(extraElName);
        // get arf qid from extra component parent
        const arfQid = extraContent?.getAttribute("arf_qid");
        // question id without repeat index
        const qid = String(id).split("-")?.[0];
        if (String(arfQid) === String(id)) {
          const commentField = extraContent.querySelector(`#comment-${qid}`);
          const commentFieldValue = commentField?.value
            ? commentField.value
            : null;
          if (
            rule?.allowNA &&
            commentFieldValue &&
            containsUnavailableText(commentFieldValue) &&
            isNaN(currentValue)
          ) {
            setNaChecked(true);
          }
        }
      }, 500);
    }
  }, [id, currentValue, coreMandatory, rule?.allowNA]);

  const onChange = useCallback(
    (e) => {
      updateDataPointName(e.target.value);
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
        !is_repeat_identifier &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={[
          ...rules,
          {
            validator: (_, value) => {
              const questionLabel = renderQuestionLabelForErrorMessage(
                name.props.children
              );
              const requiredErr = `${questionLabel} ${uiText.errorIsRequired}`;
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
        {show_as_textarea ? (
          <TextArea
            row={4}
            disabled={
              naChecked || is_repeat_identifier || disableFieldByDependency
            }
          />
        ) : (
          <Input
            style={{ width: "100%" }}
            onBlur={() => {
              setShowPrefix((prev) => prev.filter((p) => p !== id));
            }}
            onFocus={() => setShowPrefix((prev) => [...prev, id])}
            onChange={onChange}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            prefix={
              fieldIcons &&
              !showPrefix?.includes(id) &&
              !currentValue && <InputFieldIcon />
            }
            disabled={
              naChecked || is_repeat_identifier || disableFieldByDependency
            } // handle leading_question -> is_repeat_identifier
          />
        )}
      </Form.Item>

      {/* inputDataUnavailable */}
      <DataUnavailableField
        allowNA={rule?.allowNA}
        coreMandatory={coreMandatory}
        keyform={keyform}
        id={id}
        naChecked={naChecked}
        setNaChecked={setNaChecked}
        show_repeat_in_question_level={show_repeat_in_question_level}
      />

      {!!extraAfter?.length &&
        !is_repeat_identifier &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

const TypeInput = ({
  id,
  name,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  requiredSign,
  fieldIcons = true,
  coreMandatory,
  uiText,
  rule,
  is_repeat_identifier,
  show_repeat_in_question_level,
  repeats,
  show_as_textarea,
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
          <InputField
            id={`${id}-${r}`}
            name={name}
            keyform={keyform}
            required={required}
            rules={rules}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            fieldIcons={fieldIcons}
            coreMandatory={coreMandatory}
            uiText={uiText}
            is_repeat_identifier={is_repeat_identifier}
            show_as_textarea={show_as_textarea}
            dependency={dependency}
            repeat={r}
            show_repeat_in_question_level={show_repeat_in_question_level}
            extra={extra}
            rule={rule}
            meta={meta}
          />
        ),
      };
    });
  }, [
    hideFields,
    show_repeat_in_question_level,
    repeats,
    addonAfter,
    addonBefore,
    coreMandatory,
    fieldIcons,
    id,
    is_repeat_identifier,
    keyform,
    name,
    required,
    rules,
    uiText,
    show_as_textarea,
    dependency,
    rule,
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
          fieldIcons={fieldIcons}
        />
      }
      tooltip={tooltip?.text}
      required={required}
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <InputField
          id={id}
          name={name}
          keyform={keyform}
          required={required}
          rules={rules}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          fieldIcons={fieldIcons}
          coreMandatory={coreMandatory}
          uiText={uiText}
          is_repeat_identifier={is_repeat_identifier}
          show_as_textarea={show_as_textarea}
          extra={extra}
          meta={meta}
          rule={rule}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeInput;
