import React, { useMemo } from "react";
import { Form, Tag, TreeSelect } from "antd";
import { cloneDeep } from "lodash";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from "../lib";

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

const TreeField = ({
  id,
  keyform,
  required,
  rules,
  tooltip,
  show_repeat_in_question_level,
  dependency,
  repeat,
  tree,
  extra,
  checkStrategy,
  uiText,
  expandAll,
}) => {
  const form = Form.useFormInstance();

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
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}

      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={disableFieldByDependency ? "" : id}
        rules={rules}
        required={required}
        tooltip={tooltip?.text}
      >
        <TreeSelect
          onFocus={(e) => (e.target.readOnly = true)}
          getPopupContainer={(trigger) => trigger.parentNode}
          {...tProps}
          disabled={disableFieldByDependency}
        />
      </Form.Item>

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </div>
  );
};

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
          <TreeField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            tooltip={tooltip}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            tree={tree}
            extra={extra}
            checkStrategy={checkStrategy}
            uiText={uiText}
            expandAll={expandAll}
          />
        ),
      };
    });
  }, [
    hideFields,
    id,
    keyform,
    repeats,
    required,
    rules,
    tooltip,
    show_repeat_in_question_level,
    dependency,
    tree,
    extra,
    checkStrategy,
    uiText,
    expandAll,
  ]);

  if (hideFields) {
    return null;
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
      required={required}
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <TreeField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          tooltip={tooltip}
          tree={tree}
          extra={extra}
          checkStrategy={checkStrategy}
          uiText={uiText}
          expandAll={expandAll}
        />
      )}
    </Form.Item>
  );
};

export default TypeTree;
