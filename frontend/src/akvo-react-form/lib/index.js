import React from "react";
import ReactDOMServer from "react-dom/server";
import ReactHtmlParser from "react-html-parser";
import { intersection, orderBy } from "lodash";
import * as locale from "locale-codes";

const getDependencyAncestors = (
  questions,
  current,
  dependencies,
  questionId,
  questionName
) => {
  const ids = dependencies.map((x) => {
    if (typeof x?.id === "undefined") {
      console.info("Dependency Ancestors", {
        questionId,
        questionName,
        current,
        dependencies,
      });
    }
    return x?.id;
  });
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency);
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency);
    current = [current, ...dependencies].flatMap((x) => x);
    ancestors.forEach((a) => {
      if (a?.dependency) {
        current = getDependencyAncestors(
          questions,
          current,
          a.dependency,
          questionId,
          questionName
        );
      }
    });
  }
  return current;
};

export const transformForm = (forms) => {
  const questions = forms?.question_group
    .map((x) => {
      return x.question;
    })
    .flatMap((x) => x)
    .map((x) => {
      if (x.type === "option" || x.type === "multiple_option") {
        const options = x.option.map((o) => ({ ...o, label: o.name }));
        return {
          ...x,
          option: orderBy(options, "order"),
        };
      }
      return x;
    });

  const transformed = questions.map((x) => {
    if (x?.dependency) {
      return {
        ...x,
        dependency: getDependencyAncestors(
          questions,
          x.dependency,
          x.dependency,
          x.id,
          x.name
        ),
      };
    }
    return x;
  });

  const languages = forms?.languages?.map((x) => ({
    label: locale.getByTag(x).name,
    value: x,
  })) || [{ label: "English", value: "en" }];

  return {
    ...forms,
    languages: languages,
    question_group: orderBy(forms?.question_group, "order")?.map((qg) => {
      let repeat = {};
      let repeats = {};
      // handle not leading_question
      if (qg?.repeatable && !qg?.leading_question) {
        repeat = { repeat: 1 };
        repeats = { repeats: [0] };
      }
      // handle leading_question
      if (qg?.repeatable && qg?.leading_question) {
        repeat = { repeat: 0 };
        repeats = { repeats: [] };
      }
      return {
        ...qg,
        ...repeat,
        ...repeats,
        question: orderBy(qg.question, "order")?.map((q) => {
          return {
            ...transformed.find((t) => t.id === q.id),
            group_leading_question: qg?.leading_question || null, // handle leading question
          };
        }),
      };
    }),
  };
};

const translateObject = (obj, name, lang, parse = false) => {
  const html =
    obj?.translations?.find((x) => x.language === lang)?.[name] ||
    obj?.[name] ||
    "";
  if (html.length > 0 && parse) {
    return <div>{ReactHtmlParser(html)}</div>;
  }
  return html;
};

export const translateForm = (forms, lang) => {
  forms = {
    ...forms,
    name: translateObject(forms, "name", lang),
    description: translateObject(forms, "description", lang),
    question_group: forms.question_group.map((qg) => ({
      ...qg,
      name: translateObject(qg, "name", lang),
      description: translateObject(qg, "description", lang, true),
      repeatText: translateObject(qg, "repeatText", lang),
      question: qg.question.map((q) => {
        q = {
          ...q,
          name: translateObject(q, "name", lang, true),
          tooltip: {
            ...q.tooltip,
            text: translateObject(q.tooltip, "text", lang, true),
          },
        };
        if (q?.extra?.length) {
          q = {
            ...q,
            extra: q.extra.map((ex) => ({
              ...ex,
              content: translateObject(ex, "content", lang, true),
            })),
          };
        }
        if (q?.allowOtherText) {
          q = {
            ...q,
            allowOtherText: translateObject(q, "allowOtherText", lang),
          };
        }
        if (q.type === "option" || q.type === "multiple_option") {
          return {
            ...q,
            option: q.option.map((o) => ({
              ...o,
              label: translateObject(o, "name", lang),
            })),
          };
        }
        return q;
      }),
    })),
  };
  return forms;
};

export const modifyRuleMessage = (r, uiText) => {
  if (!isNaN(r?.max) || !isNaN(r?.min)) {
    if (!isNaN(r?.max) && !isNaN(r?.min)) {
      return {
        ...r,
        message: `${uiText.errorMinMax} ${r.min} - ${r.max}`,
      };
    }
    if (!isNaN(r?.max)) {
      return {
        ...r,
        message: `${uiText.errorMax} ${r.max}`,
      };
    }
    if (!isNaN(r?.min)) {
      return {
        ...r,
        message: `${uiText.errorMin} ${r.min}`,
      };
    }
  }
  return r;
};

export const mapRules = ({ rule, type }) => {
  if (type === "number") {
    return [
      {
        ...rule,
        type: "number",
      },
    ];
  }
  return [{}];
};

export const validateDependency = (dependency, value) => {
  if (dependency?.options) {
    if (typeof value === "string") {
      value = [value];
    }
    return intersection(dependency.options, value)?.length > 0;
  }
  let valid = false;
  if (dependency?.min) {
    valid = value >= dependency.min;
  }
  if (dependency?.max) {
    valid = value <= dependency.max;
  }
  if (dependency?.equal) {
    valid = value === dependency.equal;
  }
  if (dependency?.notEqual) {
    valid = value !== dependency.notEqual && !!value;
  }
  return valid;
};

export const modifyDependency = (
  { show_repeat_in_question_level, question },
  { repeats, dependency },
  repeat
) => {
  const questions = question.map((q) => q.id);
  // handle show repeat in question level
  if (show_repeat_in_question_level) {
    const modified = repeats.map((r) => {
      return dependency.map((d) => {
        if (questions.includes(d.id) && r) {
          return { ...d, id: `${d.id}-${r}` };
        }
        return d;
      });
    });
    return modified.flatMap((x) => x);
  }
  return dependency.map((d) => {
    if (questions.includes(d.id) && repeat) {
      return { ...d, id: `${d.id}-${repeat}` };
    }
    return d;
  });
};

export const todayDate = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date();
  return `${
    monthNames[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

export const detectMobile = () => {
  /* Use references from https://stackoverflow.com/a/11381730 */
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];
  const mobileBrowser = toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
  return (
    window.matchMedia("only screen and (max-width: 1064px)").matches ||
    mobileBrowser
  );
};

export const generateDataPointName = (dataPointNameValues) => {
  const dpName = dataPointNameValues
    .filter((d) => d.type !== "geo" && (d.value || d.value === 0))
    .map((x) => x.value)
    .join(" - ");
  const dpGeo = dataPointNameValues.find((d) => d.type === "geo")?.value;
  return { dpName, dpGeo };
};

export const filterFormValues = (values, formValue) => {
  const questionsWithType = formValue?.question_group?.flatMap((qg) =>
    qg?.question?.map((q) => ({ id: q.id, type: q.type }))
  );
  const resValues = Object.keys(values)
    .map((k) => {
      const qtype = questionsWithType.find((q) => q.id === parseInt(k))?.type;
      let val = values[k];
      // check array
      if (val && Array.isArray(val)) {
        const check = val.filter(
          (y) => typeof y !== "undefined" && (y || isNaN(y))
        );
        val = check.length ? check : null;
      }
      // check object
      if (val && typeof val === "object" && !Array.isArray(val)) {
        // lat - lng
        if (!val?.lat && !val?.lng && qtype === "geo") {
          delete val?.lat;
          delete val?.lng;
          val = null;
        }
      }
      return {
        id: k.toString(),
        value: val,
      };
    })
    .filter((x) => !x.id.includes("other-option"))
    .reduce((curr, next) => ({ ...curr, [next.id]: next.value }), {});
  return resValues;
};

export const renderQuestionLabelForErrorMessage = (arr) => {
  if (!arr) {
    return "";
  }
  return arr
    .map((x) =>
      React.isValidElement(x)
        ? String(ReactDOMServer.renderToStaticMarkup(x)).replace(/<[^>]*>/g, "")
        : x
    )
    .join("");
};

export const validateDisableDependencyQuestionInRepeatQuestionLevel = ({
  formRef,
  show_repeat_in_question_level,
  dependency,
  repeat,
}) => {
  if (show_repeat_in_question_level && dependency && dependency?.length) {
    const modifiedDependency = dependency.map((d) => ({
      ...d,
      id: `${d.id}-${repeat}`,
    }));
    const unmatches = modifiedDependency
      .map((x) => {
        return validateDependency(x, formRef.getFieldValue(x.id));
      })
      .filter((x) => x === false);
    return unmatches.length ? true : false;
  }
  return false;
};

export const checkHideFieldsForRepeatInQuestionLevel = ({
  show_repeat_in_question_level,
  repeats,
  formRef,
  dependency,
}) => {
  if (show_repeat_in_question_level && repeats) {
    const hideFields = repeats
      .map((repeat) => {
        return validateDisableDependencyQuestionInRepeatQuestionLevel({
          formRef,
          show_repeat_in_question_level,
          dependency,
          repeat,
        });
      })
      .filter((x) => x);
    return hideFields?.length === repeats?.length;
  }
  return false;
};
