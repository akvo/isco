import React, { useMemo } from "react";
import { translateForm } from "../lib";

const style = {
  container: {
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    color: "#000",
  },
  titleWrapper: {},
  title: {
    textAlign: "center",
    fontSize: "20px",
  },
  contentWrapper: {
    marginTop: "24px",
  },
  questionGroupWrapper: {
    width: "100%",
    marginBottom: "24px",
  },
  questionGroupDetailWrapper: {
    width: "100%",
    padding: "15px",
    background: "#EFEFEF",
    borderBottom: "1.5px solid #777777",
    pageBreakInside: "avoid",
  },
  questionGroupTitle: {
    margin: 0,
  },
  questionGroupRepeatable: {
    margin: 0,
    lineHeight: "23px",
  },
  questionGroupDescription: {
    marginTop: "16px",
    lineHeight: "23px",
    fontStyle: "italic",
  },
  questionWrapper: {
    fontSize: "16px",
    width: "100%",
    padding: "12px",
    border: "1.5px solid #777777",
    marginTop: "8px",
    marginBottom: "11px",
    pageBreakInside: "avoid",
  },
  questionParentWrapper: {
    display: "flex",
    flexDirection: "row",
  },
  questionDependencyWrapper: {
    marginBottom: "8px",
    lineHeight: "23px",
    fontStyle: "italic",
    fontSize: "14px",
    background: "#f4f4f4",
    padding: "5px",
  },
  questionIndex: {
    width: "3.5%",
    marginRight: "5px",
    lineHeight: "23px",
  },
  questionDetailWrapper: {
    width: "94%",
  },
  questionTitle: {
    margin: 0,
    lineHeight: "23px",
  },
  questionTooltip: {
    margin: 0,
    marginTop: "5px",
    lineHeight: "23px",
    display: "flex",
    background: "#f4f4f4",
    fontStyle: "italic",
    fontSize: "14px",
    padding: "5px",
  },
  questionType: {
    margin: 0,
    lineHeight: "23px",
  },
  questionOptionWrapper: {
    margin: 0,
    lineHeight: "23px",
  },
};

const Question = ({ form, question, printConfig }) => {
  const { question_group: questionGroups, tree } = form;
  const {
    name,
    index,
    required,
    tooltip,
    type,
    option,
    dependency,
    allowOther,
    allowOtherText,
  } = question;
  const { hideInputType } = printConfig;

  const renderDependency = () => {
    const dependencies = dependency
      .map((d, di) => {
        const findGroup = questionGroups
          .map((qg) => {
            const findQuestion = qg.question.find((q) => q.id === d.id);
            if (findQuestion) {
              return {
                ...qg,
                question: findQuestion,
              };
            }
            return false;
          })
          .find((qg) => qg);
        if (!findGroup) {
          return false;
        }
        return (
          <li key={`dependency-${d.id}-${di}`}>
            {`Question: ${findGroup?.name}: #${
              findGroup.question.index
            } | condition:
          ${
            d?.options?.join(", ") ||
            d?.max ||
            d?.min ||
            d?.equal ||
            d?.notEqual
          }`}
          </li>
        );
      })
      .filter((d) => d);
    return (
      <tr colSpan={2}>
        <td style={style.questionDependencyWrapper}>
          <ul
            style={{
              listStyleType: "none",
              margin: 0,
              padding: 0,
            }}
          >
            Dependency: {dependencies}
          </ul>
        </td>
      </tr>
    );
  };
  const renderIndex = () => `${index}.`;
  const renderTitle = () => {
    const requiredMark = required ? (
      <span style={{ color: "red", marginRight: "5px" }}>*</span>
    ) : (
      ""
    );
    return (
      <li style={style.questionTitle}>
        <div style={{ display: "flex" }}>
          {requiredMark}
          {name}
        </div>
      </li>
    );
  };
  const renderTooltip = () =>
    tooltip?.text ? (
      <li style={style.questionTooltip}>
        <span style={{ marginRight: "5px" }}>Tooltip:</span> {tooltip.text}
      </li>
    ) : (
      ""
    );
  const renderType = () => {
    if (hideInputType && hideInputType.includes(type)) {
      return "";
    }
    const transformType = type === "tree" ? "nested_multiple_option" : type;
    return (
      <li style={style.questionType}>
        <span style={{ marginRight: "5px" }}>Input:</span>
        {transformType.split("_").join(" ")}
      </li>
    );
  };
  const renderOptions = () => {
    if (type !== "option" && type !== "multiple_option") {
      return "";
    }
    let transformOption = option;
    if (allowOther) {
      const otherText = allowOtherText || "Other";
      transformOption = [
        ...transformOption,
        {
          name: otherText,
          label: otherText,
          order: option.length + 1,
          translations: [],
        },
      ];
    }
    const inputType = type === "option" ? "radio" : "checkbox";
    return transformOption.map((o, oi) => (
      <li key={`${type}-${oi}`} style={style.questionOptionWrapper}>
        <input type={inputType} />
        <label style={{ marginLeft: "5px" }}>{o.label}</label>
      </li>
    ));
  };
  const renderTree = (child = false) => {
    if (type !== "tree") {
      return "";
    }
    const treeData = !child ? tree?.[option] : child;
    const marginPadding = !child
      ? { margin: 0, padding: 0 }
      : { margin: 0, paddingLeft: "1em" };
    const render =
      treeData &&
      treeData.map((td, tdi) => {
        const { title, children } = td;
        return (
          <ul
            key={`${title}-${tdi}`}
            style={{
              listStyleType: "none",
              lineHeight: "23px",
              ...marginPadding,
            }}
          >
            <li>
              <input type="checkbox" />
              <label style={{ marginLeft: "5px" }}>{title}</label>
              {children ? renderTree(children) : ""}
            </li>
          </ul>
        );
      });
    return render;
  };

  /**
   * check for question has dependency but,
   * the dependent question not defined
   */
  if (dependency && dependency.length) {
    const allQuestions = questionGroups?.flatMap((qg) => qg.question);
    const checkQuestionNotDefined = dependency
      .map((d) => {
        const check = allQuestions.find((q) => q.id === d.id);
        return check ? true : false;
      })
      .filter((c) => !c);
    if (checkQuestionNotDefined.length) {
      return "";
    }
  }

  return (
    <table style={style.questionWrapper}>
      <tbody>
        {dependency && dependency?.length && renderDependency()}
        <tr style={style.questionParentWrapper}>
          <td style={style.questionIndex}>{renderIndex()}</td>
          <td style={style.questionDetailWrapper}>
            <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
              {renderTitle()}
              {renderTooltip()}
              {renderType()}
              {renderOptions()}
              {renderTree()}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const QuestionGroup = ({ form, group, printConfig }) => {
  const {
    name: groupName,
    description: groupDescription,
    question: questions,
    repeatable,
  } = group;
  return (
    <table style={style.questionGroupWrapper}>
      <tbody>
        <tr>
          <td style={style.questionGroupDetailWrapper}>
            <h3 style={style.questionGroupTitle}>{groupName}</h3>
            {repeatable && (
              <p style={style.questionGroupRepeatable}>
                Multiple entries enabled
              </p>
            )}
            {groupDescription && (
              <span style={style.questionGroupDescription}>
                Description: {groupDescription}
              </span>
            )}
          </td>
        </tr>
        <tr>
          <td>
            {questions.map((q, qi) => (
              <Question
                key={`question-${qi}`}
                form={form}
                question={q}
                printConfig={printConfig}
              />
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const Print = ({ forms, lang, printConfig }) => {
  forms = translateForm(forms, lang);
  const transformForms = useMemo(() => {
    if (forms?.question_group) {
      const updatedGroups = forms.question_group.map((qg) => {
        if (qg?.question) {
          // add index as question number
          const updatedQuestion = qg.question.map((q, qi) => ({
            ...q,
            index: qi + 1,
          }));
          return {
            ...qg,
            question: updatedQuestion,
          };
        }
        return qg;
      });
      return {
        ...forms,
        question_group: updatedGroups,
      };
    }
    return forms;
  }, [forms]);
  const { name: formName, question_group: questionGroups } = transformForms;
  const { header } = printConfig;

  return (
    <div id="arf-print" style={style.container}>
      {header || ""}
      <div style={style.titleWrapper}>
        <h2 style={style.title}>{formName}</h2>
      </div>
      <div style={style.contentWrapper}>
        {questionGroups.map((qg, qgi) => (
          <QuestionGroup
            key={`question-group-${qgi}`}
            form={transformForms}
            group={qg}
            printConfig={printConfig}
          />
        ))}
      </div>
    </div>
  );
};

export default Print;
