import React from "react";
import { Col, Form, Input } from "antd";
import { TableField, Extra, FieldLabel } from "../support";
import GlobalStore from "../lib/store";
import ds from "../lib/db";

const TypeTable = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  columns,
  requiredSign,
  uiText,
}) => {
  const form = Form.useFormInstance();
  const initialData = form.getFieldValue(id);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];

  const setValue = (data) => {
    const value = { [id]: data };
    form.setFieldsValue(value);
    GlobalStore.update((gs) => {
      gs.current = { ...gs.current, ...value };
    });
    ds.value.save({
      questionId: id,
      value: data,
    });
  };

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
        {!!extraBefore?.length &&
          extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
        <Form.Item
          className="arf-field-table"
          name={id}
          rules={rules}
          required={required}
        >
          <Input disabled hidden />
        </Form.Item>
        <TableField
          columns={columns}
          setValue={setValue}
          initialData={initialData}
          uiText={uiText}
        />
        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
      </Form.Item>
    </Col>
  );
};

export default TypeTable;
