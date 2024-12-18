import React, { useEffect, useMemo, useCallback } from "react";
import { Form, Cascader } from "antd";
import takeRight from "lodash/takeRight";
import flattenDeep from "lodash/flattenDeep";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import GlobalStore from "../lib/store";
import TypeCascadeApi from "./TypeCascadeApi";

const CascadeField = ({
  cascade,
  id,
  keyform,
  required,
  rules,
  uiText,
  onChange,
}) => {
  return (
    <Form.Item
      className="arf-field-child"
      key={keyform}
      name={id}
      rules={rules}
      required={required}
    >
      <Cascader
        options={cascade}
        getPopupContainer={(trigger) => trigger.parentNode}
        onFocus={(e) => (e.target.readOnly = true)}
        showSearch
        placeholder={uiText.pleaseSelect}
        onChange={onChange}
      />
    </Form.Item>
  );
};

const TypeCascade = ({
  cascade,
  id,
  name,
  form,
  api,
  keyform,
  required,
  meta,
  rules,
  tooltip,
  extra,
  initialValue,
  requiredSign,
  partialRequired,
  uiText,
  show_repeat_as_table,
  repeats,
}) => {
  const formInstance = Form.useFormInstance();
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];
  const currentValue = formInstance.getFieldValue([id]);

  const combineLabelWithParent = useCallback((cascadeValue, parent) => {
    return cascadeValue?.map((c) => {
      if (c?.children) {
        return combineLabelWithParent(c.children, `${parent} - ${c.label}`);
      }
      return { ...c, parent: parent };
    });
  }, []);

  const transformCascade = useCallback(() => {
    const transform = cascade.map((c) => {
      return combineLabelWithParent(c?.children, c.label);
    });
    return flattenDeep(transform);
  }, [cascade, combineLabelWithParent]);

  const updateDataPointName = useCallback(
    (value) => {
      if (cascade && !api && meta) {
        const lastVal = takeRight(value)[0];
        const findLocation = transformCascade().find(
          (t) => t.value === lastVal
        );
        const combined = `${findLocation.parent} - ${findLocation.label}`;
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: combined,
                }
              : g
          );
        });
      }
    },
    [meta, id, api, cascade, transformCascade]
  );

  useEffect(() => {
    if (currentValue && currentValue?.length) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  const handleChangeCascader = useCallback(
    (val) => {
      updateDataPointName(val);
    },
    [updateDataPointName]
  );

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!cascade && api) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <CascadeField
            id={`${id}-${r}`}
            cascade={cascade}
            keyform={keyform}
            required={required}
            rules={rules}
            uiText={uiText}
            onChange={handleChangeCascader}
          />
        ),
      };
    });
  }, [
    api,
    cascade,
    handleChangeCascader,
    id,
    keyform,
    repeats,
    required,
    rules,
    uiText,
  ]);

  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        meta={meta}
        rules={rules}
        tooltip={tooltip}
        initialValue={initialValue}
        extraBefore={extraBefore}
        extraAfter={extraAfter}
        requiredSign={required ? requiredSign : null}
        partialRequired={partialRequired}
        uiText={uiText}
        show_repeat_as_table={show_repeat_as_table}
        repeats={repeats}
      />
    );
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
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

      {/* Show as repeat inputs or not */}
      {show_repeat_as_table ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <CascadeField
          id={id}
          cascade={cascade}
          keyform={keyform}
          required={required}
          rules={rules}
          uiText={uiText}
          onChange={handleChangeCascader}
        />
      )}

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};

export default TypeCascade;
