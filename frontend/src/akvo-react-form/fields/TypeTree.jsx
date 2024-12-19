import React, { useMemo } from "react";
import { Form, Tag, TreeSelect } from "antd";
import { cloneDeep } from "lodash";
import { Extra, FieldLabel, RepeatTableView } from "../support";

const { SHOW_PARENT, SHOW_CHILD } = TreeSelect;

const restructureTree = (parent, data) => {
  if (parent) {
    data.value = `${parent}|${data.value}`;
  }
  if (data?.children) {
    data.children = data.children.map((x) => restructureTree(data.value, x));
  }
  return data;
};

const TreeField = ({ id, keyform, required, rules, tooltip, tProps }) => (
  <Form.Item
    className="arf-field-child"
    key={keyform}
    name={id}
    rules={rules}
    required={required}
    tooltip={tooltip?.text}
  >
    <TreeSelect
      onFocus={(e) => (e.target.readOnly = true)}
      getPopupContainer={(trigger) => trigger.parentNode}
      {...tProps}
    />
  </Form.Item>
);

const TypeTree = ({
  tree,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  checkStrategy = "parent",
  expandAll = false,
  requiredSign,
  uiText,
  show_repeat_as_table,
  repeats,
}) => {
  const treeData = cloneDeep(tree)?.map((x) => restructureTree(false, x));

  const tProps = useMemo(() => {
    return {
      treeData,
      treeCheckable: true,
      showCheckedStrategy:
        checkStrategy === "parent" ? SHOW_PARENT : SHOW_CHILD,
      treeDefaultExpandAll: expandAll,
      tagRender: (props) => {
        const val = props.value.replace("|", " - ");
        return (
          <Tag key={val} className="tag-tree" closable onClose={props.onClose}>
            {val}
          </Tag>
        );
      },
      placeholder: uiText.pleaseSelect,
      style: {
        width: "100%",
      },
    };
  }, [checkStrategy, expandAll, treeData, uiText.pleaseSelect]);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <TreeField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            tooltip={tooltip}
            tProps={tProps}
          />
        ),
      };
    });
  }, [id, keyform, repeats, required, rules, tProps, tooltip]);

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

      {/* TODO :: TreeField here */}
      {/* Show as repeat inputs or not */}
      {show_repeat_as_table ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <TreeField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          tooltip={tooltip}
          tProps={tProps}
        />
      )}

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};

export default TypeTree;
