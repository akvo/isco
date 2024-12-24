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
import { renderQuestionLabelForErrorMessage } from "../lib";
import { uiText as parentUIText } from "../../static";

const dataNaTexts = [
  parentUIText.en.inputDataUnavailable,
  parentUIText.de.inputDataUnavailable,
];

const NumberField = ({
  id,
  name,
  keyform,
  uiText,
  required,
  coreMandatory,
  naChecked,
  numberRef,
  onChange,
  validateNumber,
  setShowPrefix,
  showPrefix,
  addonAfter,
  fieldIcons,
  currentValue,
  addonBefore,
  error,
  rules,
  isError,
}) => (
  <div>
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
        disabled={naChecked}
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
  </div>
);

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
  // formRef,
}) => {
  const numberRef = useRef();
  const [isError, setIsError] = useState({});
  const [error, setError] = useState({});
  const [showPrefix, setShowPrefix] = useState([]);
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
          if (
            commentField?.value &&
            isNaN(currentValue) &&
            dataNaTexts.includes(commentField?.value)
          ) {
            setNaChecked(true);
          }
        }
      }, 500);
    }
  }, [id, currentValue, coreMandatory]);

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

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level) {
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
            naChecked={naChecked}
            numberRef={numberRef}
            onChange={onChange}
            validateNumber={validateNumber}
            setShowPrefix={setShowPrefix}
            showPrefix={showPrefix}
            addonAfter={addonAfter}
            fieldIcons={fieldIcons}
            currentValue={currentValue}
            addonBefore={addonBefore}
            error={error}
            rules={rules}
            isError={isError}
          />
        ),
      };
    });
  }, [
    repeats,
    show_repeat_in_question_level,
    addonAfter,
    addonBefore,
    coreMandatory,
    currentValue,
    fieldIcons,
    id,
    keyform,
    naChecked,
    name,
    onChange,
    required,
    rules,
    showPrefix,
    uiText,
    error,
    isError,
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
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

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
          naChecked={naChecked}
          numberRef={numberRef}
          onChange={onChange}
          validateNumber={validateNumber}
          setShowPrefix={setShowPrefix}
          showPrefix={showPrefix}
          addonAfter={addonAfter}
          fieldIcons={fieldIcons}
          currentValue={currentValue}
          addonBefore={addonBefore}
          error={error}
          rules={rules}
          isError={isError}
        />
      )}
      {/* EOL Show as repeat inputs or not */}

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
