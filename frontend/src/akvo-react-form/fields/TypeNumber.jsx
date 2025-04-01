import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { Form, InputNumber } from "antd";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import { InputNumberIcon, InputNumberDecimalIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";
import {
  renderQuestionLabelForErrorMessage,
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
  containsUnavailableText,
} from "../lib";

const NumberField = ({
  id,
  name,
  keyform,
  uiText,
  required,
  coreMandatory,
  addonAfter,
  fieldIcons,
  addonBefore,
  rules,
  show_repeat_in_question_level,
  dependency,
  repeat,
  extra,
  rule,
  meta,
}) => {
  const form = Form.useFormInstance();
  const numberRef = useRef();
  const [isError, setIsError] = useState({});
  const [error, setError] = useState({});
  const [showPrefix, setShowPrefix] = useState([]);
  const [naChecked, setNaChecked] = useState(false);

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
                  value: typeof value !== "undefined" ? value.toString() : null,
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
    (value, fieldId) => {
      setError((prev) => ({ ...prev, [fieldId]: "" }));
      setIsError((prev) => ({ ...prev, [fieldId]: false }));
      updateDataPointName(value);
    },
    [updateDataPointName, setError, setIsError]
  );

  const validateNumber = (v, fieldId) => {
    if (v && isNaN(v) && (typeof v === "string" || v instanceof String)) {
      setError((prev) => ({ ...prev, [fieldId]: "Only numbers are allowed" }));
      setIsError((prev) => ({ ...prev, [fieldId]: true }));
    }
  };

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
        key={keyform}
        name={disableFieldByDependency ? "" : id}
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
        className="arf-field-child"
        required={coreMandatory ? required : !naChecked ? required : false}
      >
        <InputNumber
          onBlur={() => {
            validateNumber(numberRef.current.value, id);
            setShowPrefix((prev) => prev.filter((p) => p !== id));
          }}
          onFocus={() => setShowPrefix((prev) => [...prev, id])}
          ref={numberRef}
          inputMode="numeric"
          style={{ width: "100%" }}
          onChange={(e) => onChange(e, id)}
          addonAfter={addonAfter}
          prefix={
            fieldIcons &&
            !showPrefix.includes(id) &&
            !currentValue && (
              <>
                {rules?.filter((item) => item.allowDecimal)?.length === 0 ? (
                  <InputNumberIcon />
                ) : (
                  <InputNumberDecimalIcon />
                )}
              </>
            )
          }
          addonBefore={addonBefore}
          disabled={naChecked || disableFieldByDependency}
        />
      </Form.Item>
      {isError?.[id] && (
        <div
          style={{ marginTop: "-10px" }}
          className="ant-form-item-explain-error"
        >
          {error?.[id]}
        </div>
      )}

      {/* inputDataUnavailable */}
      <DataUnavailableField
        allowNA={rule?.allowNA}
        coreMandatory={coreMandatory}
        keyform={keyform}
        id={id}
        naChecked={naChecked}
        setNaChecked={setNaChecked}
        show_repeat_in_question_level={show_repeat_in_question_level}
        disabled={disableFieldByDependency}
      />

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

const TypeNumber = ({
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
  coreMandatory,
  fieldIcons = true,
  uiText,
  rule,
  show_repeat_in_question_level,
  repeats,
  dependency,
  // formRef,
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
          <NumberField
            id={`${id}-${r}`}
            name={name}
            keyform={keyform}
            uiText={uiText}
            required={required}
            coreMandatory={coreMandatory}
            addonAfter={addonAfter}
            fieldIcons={fieldIcons}
            addonBefore={addonBefore}
            rules={rules}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            rule={rule}
            extra={extra}
            meta={meta}
          />
        ),
      };
    });
  }, [
    hideFields,
    repeats,
    show_repeat_in_question_level,
    addonAfter,
    addonBefore,
    coreMandatory,
    fieldIcons,
    id,
    keyform,
    name,
    required,
    rules,
    uiText,
    dependency,
    extra,
    rule,
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
        <NumberField
          id={id}
          name={name}
          keyform={keyform}
          uiText={uiText}
          required={required}
          coreMandatory={coreMandatory}
          addonAfter={addonAfter}
          fieldIcons={fieldIcons}
          addonBefore={addonBefore}
          rules={rules}
          rule={rule}
          extra={extra}
          meta={meta}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeNumber;
