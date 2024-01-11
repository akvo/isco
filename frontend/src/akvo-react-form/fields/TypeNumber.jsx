import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { Form, InputNumber, Checkbox } from "antd";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import { InputNumberIcon, InputNumberDecimalIcon } from "../lib/svgIcons";
import uiText from "../../static/ui-text";
import { store } from "../../lib";

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
  uiTextForm,
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [showPrefix, setShowPrefix] = useState(true);
  const [naChecked, setNaChecked] = useState(false);

  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

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
              const requiredErr = `${name.props.children[0]} ${uiTextForm.errorIsRequired}`;
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

      {/* inputDataUnavailable */}
      {!coreMandatory && (
        <Form.Item noStyle>
          <Checkbox
            checked={naChecked}
            onChange={(e) => {
              setNaChecked(e.target.checked);
            }}
          >
            {text.inputDataUnavailable}
          </Checkbox>
        </Form.Item>
      )}

      {!isValid && (
        <div
          style={{ marginTop: "-10px" }}
          className="ant-form-item-explain-error"
        >
          {error}
        </div>
      )}
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};
export default TypeNumber;
