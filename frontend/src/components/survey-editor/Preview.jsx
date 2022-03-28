import React, { useEffect, useState } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Webform } from "akvo-react-form";
import { store } from "../../lib";
import { Space, Select } from "antd";

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
  const [selectedMember, setSelectedMember] = useState(1); // All id
  const [selectedIsco, setSelectedIsco] = useState(1); // All id

  useEffect(() => {
    const allQuestion = questionGroup.flatMap((qg) => qg.question);
    const transformedQuestionGroup = questionGroup
      .filter(
        (qg) =>
          qg.member_access.includes(selectedMember) &&
          qg.isco_access.includes(selectedIsco)
      )
      .map((qg) => {
        const questions = qg.question.map((q) => {
          let qVal = {
            id: q.id,
            name: q.name,
            description: q.description,
            order: q.order,
            type: q.type,
            required: q.mandatory,
          };
          // option values
          if (q.option.length) {
            const options = q.option.filter((o) => o.name && o.id);
            qVal = {
              ...qVal,
              option: options,
            };
          }
          // transform dependency
          if (q.skip_logic.length) {
            const dependency = q.skip_logic.map((sk) => {
              if (sk.type === "option") {
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
              return {};
            });
            qVal = {
              ...qVal,
              dependency: dependency,
            };
          }
          return qVal;
        });
        return {
          ...qg,
          question: questions,
        };
      });

    const transformedForm = {
      name: formName,
      description: formDescription,
      languages: formLang,
      question_group: transformedQuestionGroup,
    };

    setFormValue(transformedForm);
    setIsLoading(false);
  }, [
    formName,
    formDescription,
    formLang,
    questionGroup,
    selectedIsco,
    selectedMember,
  ]);

  const handleOnChangeMember = (val) => {
    setSelectedMember(val);
  };

  const handleOnChangeIsco = (val) => {
    setSelectedIsco(val);
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
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Select Member Type"
              options={member_type.map((x) => ({ label: x.name, value: x.id }))}
              value={[selectedMember]}
              onChange={handleOnChangeMember}
            />
          </div>
          <div className="field-wrapper">
            <div className="field-label">ISCO Type</div>
            <Select
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Select ISCO Type"
              options={isco_type.map((x) => ({ label: x.name, value: x.id }))}
              value={[selectedIsco]}
              onChange={handleOnChangeIsco}
            />
          </div>
        </Space>
      </div>
      <div className="full-width">
        {!isLoading && (
          <Webform forms={formValue} onChange={onChange} onFinish={onFinish} />
        )}
      </div>
    </div>
  );
};

export default Preview;
