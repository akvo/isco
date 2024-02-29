import React, { useEffect, useCallback, useRef, useState } from "react";
import { Form, InputNumber } from "antd";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import { InputNumberIcon, InputNumberDecimalIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";
import { renderQuestionLabelForErrorMessage } from "../lib";

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
  // formRef,
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [showPrefix, setShowPrefix] = useState(true);
  const [naChecked, setNaChecked] = useState(false);

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
          if (commentField?.value && isNaN(currentValue)) {
            setNaChecked(true);
          }
        }
      }, 500);
    }
  }, [id, currentValue, coreMandatory]);

  const onChange = (value) => {
    setError("");
    setIsValid(true);
    updateDataPointName(value);
  };

  const validateNumber = (v) => {
    if (v && isNaN(v) && (typeof v === "string" || v instanceof String)) {
      setError("Only numbers are allowed");
      setIsValid(false);
    }
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
        className="arf-field-child"
        required={coreMandatory ? required : !naChecked ? required : false}
      >
        <InputNumber
          onBlur={() => {
            validateNumber(numberRef.current.value);
            setShowPrefix(true);
          }}
          onFocus={() => setShowPrefix(false)}
          ref={numberRef}
          inputMode="numeric"
          style={{ width: "100%" }}
          onChange={onChange}
          addonAfter={addonAfter}
          prefix={
            fieldIcons &&
            showPrefix &&
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
          disabled={naChecked}
        />
      </Form.Item>

      {!isValid && (
        <div
          style={{ marginTop: "-10px" }}
          className="ant-form-item-explain-error"
        >
          {error}
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
      />

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeNumber;
