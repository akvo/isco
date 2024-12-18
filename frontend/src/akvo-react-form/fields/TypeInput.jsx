import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Form, Input, Table } from "antd";
import { Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import { InputFieldIcon } from "../lib/svgIcons";
import { DataUnavailableField } from "../components";
import { renderQuestionLabelForErrorMessage } from "../lib";

const repeatColumns = [
  {
    title: "Repeat",
    dataIndex: "label",
    key: "label",
    width: "30%",
  },
  {
    title: "Field",
    dataIndex: "field",
    key: "field",
  },
];

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
}) => {
  const form = Form.useFormInstance();
  const [showPrefix, setShowPrefix] = useState(true);
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

  const onChange = (e) => {
    console.log(e.target.value);
    updateDataPointName(e.target.value);
  };

  const InputField = ({ fieldName }) => (
    <Form.Item
      className="arf-field-child"
      key={keyform}
      name={fieldName}
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
      <Input
        sytle={{ width: "100%" }}
        onBlur={() => {
          setShowPrefix(true);
        }}
        onFocus={() => setShowPrefix(false)}
        onChange={onChange}
        addonAfter={addonAfter}
        addonBefore={addonBefore}
        prefix={fieldIcons && showPrefix && !currentValue && <InputFieldIcon />}
        disabled={naChecked || is_repeat_identifier} // handle leading_question -> is_repeat_identifier
      />
    </Form.Item>
  );

  const repeatInputs = useMemo(() => {
    return repeats.map((r) => {
      return {
        label: r,
        field: <InputField fieldName={`${id}-${r}`} />,
      };
    });
  }, [repeats]);

  return (
    <div className="arf-field">
      <Form.Item
        // className="arf-field"
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
          <Table
            className="arf-field-child"
            rowKey={(record) => {
              return `${id}-${record?.label}`;
            }}
            size="small"
            showHeader={false}
            columns={repeatColumns}
            dataSource={repeatInputs}
            pagination={false}
          />
        ) : (
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
            <Input
              sytle={{ width: "100%" }}
              onBlur={() => {
                setShowPrefix(true);
              }}
              onFocus={() => setShowPrefix(false)}
              onChange={onChange}
              addonAfter={addonAfter}
              addonBefore={addonBefore}
              prefix={
                fieldIcons && showPrefix && !currentValue && <InputFieldIcon />
              }
              disabled={naChecked || is_repeat_identifier} // handle leading_question -> is_repeat_identifier
            />
          </Form.Item>
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
    </div>
  );
};
export default TypeInput;
