import React, { useEffect, useState, useCallback } from "react";
import { api, store } from "../../lib";
import { Space, Select } from "antd";
import { orderBy, isEmpty, uniqBy, intersection } from "lodash";
import CommentField from "./CommentField";
import { Webform } from "../../akvo-react-form";

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
  const [isLoading, setIsLoading] = useState(true);

  const allAccessId = 1;
  const [selectedMember, setSelectedMember] = useState([]);
  const [selectedIsco, setSelectedIsco] = useState([]);

  const allQuestion = questionGroup.flatMap((qg) => qg.question);
  const nestedListQuestions = allQuestion.filter(
    (q) => q.type === "nested_list"
  );

  const fetchNestedList = useCallback(async () => {
    let data = null;
    if (nestedListQuestions.length) {
      const cascadeIds = uniqBy(nestedListQuestions, "cascade")
        .map((q) => q.cascade)
        .join("|");
      await api
        .get(`/nested/list?cascade_id=${cascadeIds}`)
        .then((res) => {
          data = res.data;
        })
        .catch((e) => {
          console.error(e);
        });
    }
    return data;
  }, [nestedListQuestions]);

  useEffect(() => {
    async function transformFormDetail() {
      if (allQuestion.length && isEmpty(formValue)) {
        const treeObj = await fetchNestedList();
        let transformedQuestionGroup = questionGroup;
        transformedQuestionGroup = transformedQuestionGroup.map((qg) => {
          let group = qg;
          let questions = qg.question;
          /**
           * Step 1. When map questions, we need to remap membes/isco access,
           *         if question doesn't have member/isco access, inherit group member/isco access.
           * Step 2. After this, all questions will have access,
           *         then we can filter it by member/isco selected from dropdown */
          questions = questions.filter((q) => !q.deactivate);
          questions = questions.map((q) => {
            /** Step 1 */
            const qMemberAccess = q.member_access.length
              ? q.member_access
              : qg.member_access;
            const qIscoAccess = q.isco_access.length
              ? q.isco_access
              : qg.isco_access;
            /** End Step 1 */
            let qVal = {
              id: q.id,
              name: q.name,
              order: q.order,
              type: q.type,
              meta: q.datapoint_name, // set as datapoint/display name
              required: q.mandatory,
              coreMandatory: q.core_mandatory,
              requiredSign: q.core_mandatory ? "**" : "*",
              member_access: qMemberAccess,
              isco_access: qIscoAccess,
              is_repeat_identifier: q?.is_repeat_identifier || false,
              show_as_textarea: q?.show_as_textarea || false,
              // add comment field
              extra: [
                {
                  placement: "after",
                  content: (
                    <CommentField
                      qid={q.id}
                      onChange={() => console.info(q.id)}
                      onDelete={() => console.info(q.id)}
                    />
                  ),
                },
              ],
            };
            // option values
            if (q.option.length) {
              const options = q.option
                .filter((o) => o.name && o.id)
                .map((o) => ({
                  code: o.code,
                  name: o.name,
                  order: o.order,
                  translations: o.translations,
                }));
              qVal = {
                ...qVal,
                option: orderBy(options, ["order"]),
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
            if (
              q.rule &&
              !q.rule?.allow_other &&
              q.rule.allow_other !== false
            ) {
              qVal = {
                ...qVal,
                rule: q.rule,
              };
            }
            // autofield
            if (!isEmpty(q?.autofield)) {
              qVal = {
                ...qVal,
                fn: q.autofield,
              };
            }
            // allow decimal
            if (q.rule && q.rule?.allow_decimal) {
              qVal = {
                ...qVal,
                rule: {
                  ...q.rule,
                  allowDecimal: true,
                },
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
                  const findQ = allQuestion.find(
                    (q) => q.id === sk.dependent_to
                  );
                  const dependentOptions = answerIds.map((id) => {
                    const findOpt = findQ.option.find(
                      (o) => o.id === parseInt(id)
                    );
                    return findOpt?.name || null;
                  });
                  return {
                    id: sk.dependent_to,
                    options: dependentOptions,
                  };
                }
                // number
                if (sk.type === "number") {
                  let logic;
                  let value = Number(sk.value);
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
            // handle lead_repeat_group to be add in question param
            const leadsGroup = questionGroup.filter(
              (qg) => qg?.leading_question === q.id
            );
            if (leadsGroup?.length) {
              qVal = {
                ...qVal,
                lead_repeat_group: leadsGroup.map((qg) => qg.id),
              };
            }
            return qVal;
          });
          /** Step 2 */
          if (selectedMember && selectedMember.length) {
            questions = questions.filter(
              (q) =>
                intersection(q.member_access, selectedMember).length ||
                q.member_access.includes(allAccessId)
            );
          }
          if (selectedIsco && selectedIsco.length) {
            questions = questions.filter(
              (q) =>
                intersection(q.isco_access, selectedIsco).length ||
                q.isco_access.includes(allAccessId)
            );
          }
          /** End Step 2 */
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
        /** filter group which doesn't have questions
         * after question filtered by member/isco access */
        transformedQuestionGroup = transformedQuestionGroup.filter(
          (qg) => qg.question.length
        );
        const transformedForm = {
          name: formName,
          description: formDescription,
          languages:
            formLang && formLang?.length ? ["en", ...formLang] : ["en"],
          question_group: orderBy(transformedQuestionGroup, ["order"]),
        };
        setFormValue(
          !isEmpty(treeObj)
            ? { ...transformedForm, tree: treeObj }
            : transformedForm
        );
        setIsLoading(false);
      }
    }

    transformFormDetail();
  }, [
    formName,
    formDescription,
    formLang,
    allQuestion,
    questionGroup,
    selectedIsco,
    selectedMember,
    formValue,
    fetchNestedList,
  ]);

  const handleOnChangeMember = (val) => {
    setSelectedMember(val);
    setIsLoading(true);
    setFormValue({});
  };

  const handleOnChangeIsco = (val) => {
    setSelectedIsco(val);
    setIsLoading(true);
    setFormValue({});
  };

  const onChange = ({ current, values, progress }) => {
    console.info("onChange", current, values, progress);
  };

  const onFinish = (values) => {
    console.info("onFinish", values);
  };

  return (
    <div id="preview">
      <div className="option-wrapper">
        <Space size="large">
          <div className="field-wrapper">
            <div className="field-label">Member Type</div>
            <Select
              mode="multiple"
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
              style={{ width: "22rem" }}
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
              style={{ width: "22rem" }}
            />
          </div>
        </Space>
      </div>
      <div className="full-width">
        {!isLoading && (
          <Webform
            forms={formValue}
            onChange={onChange}
            onFinish={onFinish}
            submitButtonSetting={{
              disabled: true,
            }}
            initialValue={[]}
            printConfig={{
              showButton: true,
              hideInputType: [
                "cascade",
                "geo",
                "date",
                "input",
                "number",
                "text",
                "option",
                "multiple_option",
                "tree",
              ],
              header: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #777777",
                    marginBottom: "24px",
                  }}
                >
                  <img height={30} src="/images/beyond.jpg" alt="bc_logo" />
                  <img height={30} src="/images/gisco.jpg" alt="gisco_logo" />
                  <img height={30} src="/images/disco.png" alt="disco_logo" />
                  <img
                    height={30}
                    src="/images/swissco.svg"
                    alt="swissco_logo"
                  />
                  <img height={30} src="/images/frisco.png" alt="frisco_logo" />
                </div>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Preview;
