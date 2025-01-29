import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Form, Select } from "antd";
import axios from "axios";
import take from "lodash/take";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import ds from "../lib/db";
import GlobalStore from "../lib/store";
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";

const CascadeApiField = ({
  id,
  api,
  keyform,
  required,
  meta,
  rules,
  initialValue,
  partialRequired,
  uiText,
  dependency,
  show_repeat_in_question_level,
  repeat,
  extra,
}) => {
  const form = Form.useFormInstance();
  const formConfig = GlobalStore.useState((s) => s.formConfig);
  const { autoSave } = formConfig;
  const [cascade, setCascade] = useState([]);
  const [selected, setSelected] = useState([]);
  const { endpoint, initial, list } = api;

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];

  useEffect(() => {
    if (autoSave?.name && selected.length) {
      ds.value.update({ value: { [id]: selected } });
      GlobalStore.update((s) => {
        s.current = { ...s.current, [id]: selected };
      });
    }
    if (cascade.length && selected.length && meta) {
      const combined = cascade
        .flatMap((c) => c)
        .filter((c) => selected.includes(c.id))
        .map((c) => c.name);
      GlobalStore.update((gs) => {
        gs.dataPointName = gs.dataPointName.map((g) =>
          g.id === id
            ? {
                ...g,
                value: combined.join(" - "),
              }
            : g
        );
      });
    }
  }, [id, meta, autoSave, cascade, selected]);

  useEffect(() => {
    const ep =
      typeof initial !== "undefined" ? `${endpoint}/${initial}` : `${endpoint}`;
    axios
      .get(ep)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data;
        setCascade([data]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [endpoint, initial, list]);

  useEffect(() => {
    if (initialValue.length) {
      let calls = [];
      const ep =
        typeof initial !== "undefined"
          ? `${endpoint}/${initial}`
          : `${endpoint}`;
      const initCall = new Promise((resolve, reject) => {
        axios
          .get(ep)
          .then((res) => {
            const data = list ? res.data?.[list] : res.data;
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      });
      calls = [initCall];
      for (const id of initialValue) {
        const call = new Promise((resolve, reject) => {
          axios
            .get(`${endpoint}/${id}`)
            .then((res) => {
              const data = list ? res.data?.[list] : res.data;
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        });
        calls = [...calls, call];
      }
      Promise.all(calls).then((values) => {
        setCascade(values.filter((v) => v.length));
        setSelected(initialValue);
      });
    }
  }, [initialValue, endpoint, initial, list]);

  const handleChange = (value, index) => {
    if (!index) {
      setSelected([value]);
      form.setFieldsValue({ [id]: [value] });
    } else {
      const prevValue = take(selected, index);
      const result = [...prevValue, value];
      setSelected(result);
      form.setFieldsValue({ [id]: result });
    }
    axios
      .get(`${endpoint}/${value}`)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data;
        if (data.length) {
          const prevCascade = take(cascade, index + 1);
          setCascade([...prevCascade, ...[data]]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const isCascadeLoaded = useMemo(() => {
    const status = cascade?.[0]?.name?.toLowerCase() !== "error";
    if (cascade.length && !status) {
      console.error("Can't load Cascade value, please check your API");
    }
    return status;
  }, [cascade]);

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
      <Form.Item
        className="arf-field-cascade"
        key={keyform}
        name={id}
        rules={required && partialRequired ? rules : () => {}}
        required={required && partialRequired}
        noStyle
      >
        <Select mode="multiple" options={[]} hidden />
      </Form.Item>
      <div className="arf-field-cascade-api">
        {!!extraBefore?.length &&
          extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

        {cascade.map((c, ci) => {
          return (
            <Row
              key={`keyform-cascade-${ci}`}
              className={
                show_repeat_in_question_level ? "" : "arf-field-cascade-list"
              }
            >
              <Form.Item
                name={[id, ci]}
                noStyle
                rules={required && !partialRequired ? rules : () => {}}
                required={required && !partialRequired}
              >
                <Select
                  className="arf-cascade-api-select"
                  placeholder={`${uiText.selectLevel} ${ci + 1}`}
                  onFocus={(e) => (e.target.readOnly = true)}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  onChange={(e) => handleChange(e, ci)}
                  options={
                    isCascadeLoaded
                      ? c.map((v) => ({ label: v.name, value: v.id }))
                      : []
                  }
                  value={selected?.[ci] || null}
                  allowClear
                  showSearch
                  filterOption
                  optionFilterProp="label"
                  disabled={disableFieldByDependency}
                />
              </Form.Item>
            </Row>
          );
        })}

        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
      </div>
    </div>
  );
};

const TypeCascadeApi = ({
  id,
  name,
  api,
  keyform,
  required,
  meta,
  rules,
  tooltip,
  extra,
  initialValue = [],
  requiredSign,
  partialRequired = false,
  uiText,
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
          <CascadeApiField
            id={`${id}-${r}`}
            api={api}
            keyform={keyform}
            required={required}
            meta={meta}
            rules={rules}
            extra={extra}
            initialValue={initialValue}
            partialRequired={partialRequired}
            uiText={uiText}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
          />
        ),
      };
    });
  }, [
    hideFields,
    repeats,
    show_repeat_in_question_level,
    api,
    extra,
    id,
    initialValue,
    keyform,
    meta,
    partialRequired,
    required,
    rules,
    uiText,
    dependency,
  ]);

  if (hideFields) {
    return null;
  }

  return (
    <Col>
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
          <CascadeApiField
            id={id}
            api={api}
            keyform={keyform}
            required={required}
            meta={meta}
            rules={rules}
            extra={extra}
            initialValue={initialValue}
            partialRequired={partialRequired}
            uiText={uiText}
          />
        )}
      </Form.Item>
    </Col>
  );
};

export default TypeCascadeApi;
