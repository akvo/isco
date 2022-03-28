import React, { useEffect, useState } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Webform } from "akvo-react-form";
import { store } from "../../lib";
// import * as forms from "./example.json";

const Preview = () => {
  const { surveyEditor } = store.useState((s) => s);
  const {
    name: formName,
    description: formDescription,
    languages: formLang,
    questionGroup,
  } = surveyEditor;
  const [formValue, setFormValue] = useState({});

  useEffect(() => {
    const allQuestion = questionGroup.flatMap((qg) => qg.question);
    const transformedQuestionGroup = questionGroup.map((qg) => {
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
                const findOpt = findQ.option.find((o) => o.id === parseInt(id));
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
  }, [formName, formDescription, formLang, questionGroup]);

  const onChange = ({ current, values, progress }) => {
    console.info(current, values, progress);
  };

  const onFinish = (values) => {
    console.info(values);
  };

  return (
    <div className="full-width">
      <Webform forms={formValue} onChange={onChange} onFinish={onFinish} />
    </div>
  );
};

export default Preview;
