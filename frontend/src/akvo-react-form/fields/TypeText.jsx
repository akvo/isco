import React, { useState, useEffect, useMemo } from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import { DataUnavailableField } from "../components";
import {
  renderQuestionLabelForErrorMessage,
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";

const TextField = ({
  id,
  name,
  keyform,
  required,
  rules,
  uiText,
  coreMandatory,
  dependency,
  show_repeat_in_question_level,
  repeat,
  rule,
  extra,
}) => {
  const form = Form.useFormInstance();

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const [naChecked, setNaChecked] = useState(false);
  const currentValue = form.getFieldValue([id]);

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
          if (commentField?.value && !currentValue) {
            setNaChecked(true);
          }
        }
      }, 500);
    }
  }, [id, currentValue, coreMandatory]);

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
        <TextArea row={4} disabled={naChecked || disableFieldByDependency} />
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
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

const TypeText = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  requiredSign,
  coreMandatory,
  uiText,
  rule,
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
        field: (
          <TextField
            id={`${id}-${r}`}
            name={name}
            keyform={keyform}
            required={required}
            rules={rules}
            uiText={uiText}
            coreMandatory={coreMandatory}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            rule={rule}
            extra={extra}
          />
        ),
      };
    });
  }, [
    hideFields,
    repeats,
    id,
    name,
    keyform,
    required,
    rules,
    uiText,
    coreMandatory,
    show_repeat_in_question_level,
    dependency,
    rule,
    extra,
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
        <TextField
          id={id}
          name={name}
          keyform={keyform}
          required={required}
          rules={rules}
          uiText={uiText}
          coreMandatory={coreMandatory}
          rule={rule}
          extra={extra}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeText;
