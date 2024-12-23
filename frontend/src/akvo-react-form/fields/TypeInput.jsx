import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import { InputFieldIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";
import { renderQuestionLabelForErrorMessage } from "../lib";

const InputField = ({
  id,
  name,
  keyform,
  required,
  rules,
  addonAfter,
  addonBefore,
  fieldIcons = true,
  coreMandatory,
  uiText,
  is_repeat_identifier,
  onChange,
  showPrefix,
  setShowPrefix,
  naChecked,
  currentValue,
  show_as_textarea,
}) => (
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
      <TextArea row={4} disabled={naChecked || is_repeat_identifier} />
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
        disabled={naChecked || is_repeat_identifier} // handle leading_question -> is_repeat_identifier
      />
    )}
  </Form.Item>
);

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
  show_repeat_as_table,
  repeats,
  show_as_textarea,
}) => {
  const form = Form.useFormInstance();
  const [showPrefix, setShowPrefix] = useState([]);
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const currentValue = form.getFieldValue([id]);
  const [naChecked, setNaChecked] = useState(false);

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
          if (commentField?.value && !currentValue) {
            setNaChecked(true);
          }
        }
      }, 500);
    }
  }, [id, currentValue, coreMandatory]);

  const onChange = useCallback(
    (e) => {
      updateDataPointName(e.target.value);
    },
    [updateDataPointName]
  );

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    return repeats.map((r) => {
      return {
        label: r,
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
            onChange={onChange}
            showPrefix={showPrefix}
            setShowPrefix={setShowPrefix}
            naChecked={naChecked}
            currentValue={currentValue}
            show_as_textarea={show_as_textarea}
          />
        ),
      };
    });
  }, [
    repeats,
    addonAfter,
    addonBefore,
    coreMandatory,
    currentValue,
    fieldIcons,
    id,
    is_repeat_identifier,
    keyform,
    naChecked,
    name,
    onChange,
    required,
    rules,
    showPrefix,
    uiText,
    show_as_textarea,
  ]);

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
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

      {/* Show as repeat inputs or not */}
      {show_repeat_as_table ? (
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
          onChange={onChange}
          showPrefix={showPrefix}
          setShowPrefix={setShowPrefix}
          naChecked={naChecked}
          currentValue={currentValue}
          show_as_textarea={show_as_textarea}
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
export default TypeInput;
