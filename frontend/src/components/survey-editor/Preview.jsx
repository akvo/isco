import React, { useEffect, useState, useMemo } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { Space, Select } from "antd";
import { orderBy, isEmpty, uniqBy, intersection } from "lodash";
import CommentField from "./CommentField";

const Preview = () => {
  const { surveyEditor, optionValues } = store.useState((s) => s);
  const {
    name: formName,
    description: formDescription,
    languages: formLang,
    questionGroup,
  } = surveyEditor;
  const { member_type, isco_type } = optionValues;
  const [formValue, setFormValue] = useState({});
  const [treeObj, setTreeObj] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const allAccessId = 1;
  const [selectedMember, setSelectedMember] = useState([]);
  const [selectedIsco, setSelectedIsco] = useState([]);
  const allQuestion = questionGroup.flatMap((qg) => qg.question);
  const nestedListQuestions = allQuestion.filter(
    (q) => q.type === "nested_list"
  );

  const formPreviewValue = useMemo(
    () =>
      nestedListQuestions.length ? { ...formValue, tree: treeObj } : formValue,
    [nestedListQuestions, formValue, treeObj]
  );

  useEffect(() => {
    if (nestedListQuestions.length && isEmpty(treeObj)) {
      const cascadeIds = uniqBy(nestedListQuestions, "cascade")
        .map((q) => q.cascade)
        .join("|");
      api
        .get(`/nested/list?cascade_id=${cascadeIds}`)
        .then((res) => {
          setTreeObj(res?.data);
        })
        .catch((e) => console.error(e));
    }
  }, [nestedListQuestions, treeObj]);

  useEffect(() => {
    if (allQuestion.length && isEmpty(formValue)) {
      let transformedQuestionGroup = questionGroup;
      if (selectedMember && selectedMember.length) {
        transformedQuestionGroup = transformedQuestionGroup.filter(
          (qg) =>
            qg.member_access.includes(selectedMember) ||
            qg.member_access.includes(allAccessId)
        );
      }
      if (selectedIsco && selectedIsco.length) {
        transformedQuestionGroup = transformedQuestionGroup.filter(
          (qg) =>
            intersection(qg.isco_access, selectedIsco).length ||
            qg.isco_access.includes(allAccessId)
        );
      }
      transformedQuestionGroup = transformedQuestionGroup.map((qg) => {
        let group = qg;
        const questions = qg.question.map((q) => {
          let qVal = {
            id: q.id,
            name: q.name,
            order: q.order,
            type: q.type,
            required: q.mandatory,
            // add comment field
            extra: [
              {
                placement: "after",
                content: (
                  <CommentField
                    onChange={() => console.info(q.id)}
                    onDelete={() => console.info(q.id)}
                  />
                ),
              },
            ],
          };
          // option values
          if (q.option.length) {
            const options = q.option.filter((o) => o.name && o.id);
            qVal = {
              ...qVal,
              option: options,
            };
          }
          // nested list
          if (q.cascade && q.type === "nested_list") {
            qVal = {
              ...qVal,
              type: "tree",
              checkStrategy: "children",
              option: `tree_${q.cascade}`,
            };
          }
          // cascade
          if (q.cascade && q.type === "cascade") {
            const cascadeURL = `${location.origin}/api/cascade/list/${q.cascade}`;
            qVal = {
              ...qVal,
              api: {
                endpoint: cascadeURL,
                initial: 0,
                list: false,
              },
            };
          }
          // rule
          if (q.rule && !q.rule?.allow_other) {
            qVal = {
              ...qVal,
              rule: q.rule,
            };
          }
          // allow other
          if (q.rule && q.rule?.allow_other) {
            qVal = {
              ...qVal,
              allowOther: q.rule.allow_other,
              allowOtherText: "Other",
            };
          }
          // translations
          if (q.translations.length) {
            qVal = {
              ...qVal,
              translations: q.translations,
            };
          }
          // tooltip translations
          if (q.tooltip) {
            let tooltip = {
              text: q.tooltip,
            };
            if (q.tooltip_translations.length) {
              const transformTooltipTranslation = q.tooltip_translations.map(
                (t) => ({
                  language: t.language,
                  text: t.tooltip_translations,
                })
              );
              tooltip = {
                ...tooltip,
                translations: transformTooltipTranslation,
              };
            }
            qVal = {
              ...qVal,
              tooltip: tooltip,
            };
          }
          // repeating objects
          if (q.repeating_objects.length && q.repeating_objects?.[0]?.field) {
            const unit = q.repeating_objects.find((r) => r.field === "unit");
            const indicator = q.repeating_objects.find(
              (r) => r.field === "indicator"
            );
            if (unit) {
              qVal = {
                ...qVal,
                addonAfter: unit.value,
              };
            }
            if (indicator) {
              const values = indicator.value.split("|");
              let prefix = "Indicator";
              prefix = values.length > 1 ? `${prefix}s` : prefix;
              qVal = {
                ...qVal,
                extra: [
                  ...qVal.extra,
                  {
                    placement: "before",
                    content: `${prefix}: ${values.join(", ")}`,
                  },
                ],
              };
            }
          }
          // transform dependency
          if (q.skip_logic.length) {
            const dependency = q.skip_logic.map((sk) => {
              // option
              if (["option", "multiple_option"].includes(sk.type)) {
                let answerIds = [sk.value];
                if (sk.value.includes("|")) {
                  answerIds = sk.value.split("|");
                }
                const findQ = allQuestion.find((q) => q.id === sk.dependent_to);
                const dependentOptions = answerIds.map((id) => {
                  const findOpt = findQ.option.find(
                    (o) => o.id === parseInt(id)
                  );
                  return findOpt.name;
                });
                return {
                  id: sk.dependent_to,
                  options: dependentOptions,
                };
              }
              // number
              if (sk.type === "number") {
                let logic;
                let value = parseInt(sk.value);
                switch (sk.operator) {
                  case "not_equal":
                    logic = "not_equal";
                    break;
                  case "greater_than":
                    logic = "min";
                    value = value + 1;
                    break;
                  case "greater_than_or_equal":
                    logic = "min";
                    break;
                  case "less_than":
                    logic = "max";
                    value = value - 1;
                    break;
                  case "less_than_or_equal":
                    logic = "max";
                    break;
                  default:
                    logic = "equal";
                    break;
                }
                return {
                  id: sk.dependent_to,
                  [logic]: value,
                };
              }
            });
            qVal = {
              ...qVal,
              dependency: dependency,
            };
          }
          return qVal;
        });
        // repeatable
        if (qg.repeat) {
          group = {
            ...group,
            repeatable: qg.repeat,
            repeatText: qg.repeat_text,
            repeatButtonPlacement: "bottom",
            question: orderBy(questions, ["order"]),
          };
        }
        if (qg?.translations && qg.translations.length) {
          const translations = qg.translations.map((t) => {
            if (t?.repeat_text) {
              return {
                ...t,
                repeatText: t.repeat_text,
              };
            }
            return t;
          });
          group = {
            ...group,
            translations: translations,
          };
        }
        group = {
          ...group,
          repeatable: qg.repeat,
          question: orderBy(questions, ["order"]),
        };
        return group;
      });
      const transformedForm = {
        name: formName,
        description: formDescription,
        languages: ["en", ...formLang],
        question_group: orderBy(transformedQuestionGroup, ["order"]),
      };
      setFormValue(transformedForm);
      setIsLoading(false);
    }
  }, [
    formName,
    formDescription,
    formLang,
    allQuestion,
    questionGroup,
    selectedIsco,
    selectedMember,
    formValue,
  ]);

  const handleOnChangeMember = (val) => {
    setSelectedMember(val);
    setIsLoading(true);
    setFormValue({});
  };

  const handleOnChangeIsco = (val) => {
    setIsLoading(true);
    setSelectedIsco(val);
    setFormValue({});
  };

  const onChange = ({ current, values, progress }) => {
    console.info(current, values, progress);
  };

  const onFinish = (values) => {
    console.info(values);
  };

  return (
    <div id="preview">
      <div className="option-wrapper">
        <Space size="large">
          <div className="field-wrapper">
            <div className="field-label">Member Type</div>
            <Select
              allowClear
              showSearch
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Select Member Type"
              options={member_type.map((x) => ({ label: x.name, value: x.id }))}
              value={selectedMember}
              onChange={handleOnChangeMember}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "20rem" }}
            />
          </div>
          <div className="field-wrapper">
            <div className="field-label">ISCO</div>
            <Select
              mode="multiple"
              allowClear
              showSearch
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Select ISCO"
              options={isco_type.map((x) => ({ label: x.name, value: x.id }))}
              value={selectedIsco}
              onChange={handleOnChangeIsco}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "24rem" }}
            />
          </div>
        </Space>
      </div>
      <div className="full-width">
        {!isLoading && (
          <Webform
            forms={formPreviewValue}
            onChange={onChange}
            onFinish={onFinish}
          />
        )}
      </div>
    </div>
  );
};

export default Preview;
