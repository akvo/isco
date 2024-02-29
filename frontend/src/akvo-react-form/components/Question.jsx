import React, { useState } from "react";
import { Button, Form, Space } from "antd";
import axios from "axios";
import { isEmpty, get } from "lodash";
import {
  mapRules,
  modifyRuleMessage,
  validateDependency,
  modifyDependency,
  renderQuestionLabelForErrorMessage,
} from "../lib";
import QuestionFields from "./QuestionFields.jsx";
import GlobalStore from "../lib/store";

const Question = ({
  group,
  fields,
  tree,
  cascade,
  repeat,
  initialValue,
  uiText,
  formRef,
}) => {
  const current = GlobalStore.useState((s) => s.current);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintValue, setHintValue] = useState({});

  fields = fields?.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` };
    }
    return field;
  });
  return fields.map((field, key) => {
    if (field?.rule) {
      field = {
        ...field,
        rule: modifyRuleMessage(field.rule, uiText),
      };
    }
    let rules = [
      {
        validator: (_, value) => {
          const questionLabel = renderQuestionLabelForErrorMessage(
            field.name.props.children
          );
          const requiredErr = `${questionLabel} ${uiText.errorIsRequired}`;
          if (field?.required) {
            if (field?.type === "input" || field?.type === "text") {
              return Promise.resolve();
            }
            if (field?.type === "number" && !field?.rule?.allowDecimal) {
              if (parseFloat(value) % 1 === 0) {
                return Promise.resolve();
              }
              if (value) {
                return Promise.reject(new Error(uiText.errorDecimal));
              }
              if (field?.coreMandatory) {
                return Promise.reject(new Error(requiredErr));
              }
              return Promise.resolve();
            }
            if (
              field?.type !== "number" &&
              field?.type !== "input" &&
              field?.type !== "text"
            ) {
              return value || value === 0
                ? Promise.resolve()
                : Promise.reject(new Error(requiredErr));
            }
            return Promise.resolve();
          }
          if (field?.type === "number" && !field?.rule?.allowDecimal) {
            return parseFloat(value) % 1 === 0 || !value
              ? Promise.resolve()
              : Promise.reject(new Error(uiText.errorDecimal));
          }
          return Promise.resolve();
        },
      },
    ];
    if (field?.rule) {
      rules = [...rules, ...mapRules(field)];
    }
    // hint
    let hint = "";
    if (field?.hint) {
      const showHintValue = () => {
        setHintLoading(field.id);
        if (hintValue?.[field.id]) {
          delete hintValue?.[field.id];
        }
        if (field.hint?.endpoint) {
          axios
            .get(field.hint.endpoint)
            .then((res) => {
              let data = [res.data.mean];
              if (field.hint?.path && field.hint?.path?.length) {
                data = field.hint.path.map((p) => get(res.data, p));
              }
              setHintValue({ ...hintValue, [field.id]: data });
            })
            .catch((err) => {
              console.error(err);
            })
            .finally(() => {
              setHintLoading(false);
            });
        }
        if (field.hint?.static && !field.hint?.endpoint) {
          setTimeout(() => {
            setHintLoading(false);
            setHintValue({ ...hintValue, [field.id]: [field.hint.static] });
          }, 500);
        }
      };
      hint = (
        <Form.Item
          className="arf-field"
          style={{ marginTop: -10, paddingTop: 0 }}
        >
          <Space>
            <Button
              type="primary"
              size="small"
              ghost
              onClick={() => showHintValue()}
              loading={hintLoading === field.id}
            >
              {field.hint?.buttonText || "Validate value"}
            </Button>
            {!isEmpty(hintValue) &&
              hintValue?.[field.id] &&
              hintValue[field.id].join(", ")}
          </Space>
        </Form.Item>
      );
    }
    // eol of hint
    if (field?.dependency) {
      const modifiedDependency = modifyDependency(group, field, repeat);
      return (
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = modifiedDependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.id));
              })
              .filter((x) => x === false);
            return unmatches.length ? null : (
              <div key={`question-${field.id}`}>
                <QuestionFields
                  rules={rules}
                  index={key}
                  cascade={cascade}
                  tree={tree}
                  field={field}
                  initialValue={
                    initialValue?.find((i) => i.question === field.id)?.value
                  }
                  uiText={uiText}
                  formRef={formRef}
                />
                {hint}
              </div>
            );
          }}
        </Form.Item>
      );
    }
    return (
      <div key={`question-${field.id}`}>
        <QuestionFields
          rules={rules}
          key={key}
          index={key}
          tree={tree}
          cascade={cascade}
          field={field}
          initialValue={
            initialValue?.find((i) => i.question === field.id)?.value
          }
          uiText={uiText}
          formRef={formRef}
        />
        {hint}
      </div>
    );
  });
};

export default Question;
