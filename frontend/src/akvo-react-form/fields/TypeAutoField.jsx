import React, { useEffect, useMemo } from "react";
import { Form, Input } from "antd";
import { Extra, FieldLabel, RepeatTableView } from "../support";
import { validateDisableDependencyQuestionInRepeatQuestionLevel } from "../lib";

const checkIsPromise = (val) => {
  if (
    val !== null &&
    typeof val === "object" &&
    typeof val.then === "function" &&
    typeof val.catch === "function"
  ) {
    return true;
  }
  return false;
};

const fnRegex =
  /^function(?:.+)?(?:\s+)?\((.+)?\)(?:\s+|\n+)?\{(?:\s+|\n+)?((?:.|\n)+)\}$/m;
const fnEcmaRegex = /^\((.+)?\)(?:\s+|\n+)?=>(?:\s+|\n+)?((?:.|\n)+)$/m;
const sanitize = [
  {
    prefix: /return fetch|fetch/g,
    re: /return fetch(\(.+)\} +|fetch(\(.+)\} +/,
    log: "Fetch is not allowed.",
  },
];

const cleanString = (str) => {
  // Replace multiple spaces with a single space
  str = str.replace(/\s{2,}/g, " ");
  // Trim extra spaces at the beginning and end of the string
  str = str.trim();
  return str;
};

const checkDirty = (fnString) => {
  const cleanFnString = cleanString(fnString);
  return sanitize.reduce((prev, sn) => {
    const dirty = prev?.match(sn.re);
    if (dirty) {
      return prev
        .replace(sn.prefix, "")
        .replace(dirty[1], `console.error("${sn.log}");`);
    }
    return prev;
  }, cleanFnString);
};

const getFnMetadata = (fnString) => {
  const fnMetadata = fnRegex.exec(fnString) || fnEcmaRegex.exec(fnString);
  if (fnMetadata?.length >= 3) {
    const fn = fnMetadata[2].split(" ");
    return fn[0] === "return" ? fnMetadata[2] : `return ${fnMetadata[2]}`;
  }
  return false;
};

const generateFnBody = (fnMetadata, getFieldValue, repeatIndex) => {
  const answers = [];
  if (!fnMetadata) {
    console.error("Function must match the placeholder criteria.");
    return false;
  }
  const fnBody = fnMetadata
    .trim()
    .split(" ")
    .map((f) => {
      f = f.trim();
      const meta = f.match(/#([0-9]*)/);
      if (meta) {
        // get field value
        let fieldName = meta[1];
        if (repeatIndex) {
          fieldName = `${fieldName}-${repeatIndex}`;
        }
        let val = getFieldValue([fieldName]);
        // eol get field value
        if (!val) {
          answers.push(val);
          return 0;
        }
        if (typeof val === "number") {
          val = Number(val);
        }
        if (typeof val === "string") {
          val = `"${val}"`;
        }
        const fnMatch = f.match(/#([0-9]*|[0-9]*\..+)+/);
        if (fnMatch) {
          val = fnMatch[1] === meta[1] ? val : val + fnMatch[1];
        }
        answers.push(val);
        return val;
      }
      const n = f.match(/(^[0-9]*$)/);
      if (n) {
        return Number(n[1]);
      }
      return f;
    });
  const isAllAnswersZero = answers.filter((x) => x)?.length ? false : true;
  if (fnBody.filter((x) => x === null && typeof x === "undefined").length) {
    return {
      fnBody: false,
      isAllAnswersZero: isAllAnswersZero,
    };
  }
  return {
    fnBody: fnBody.join(" "),
    isAllAnswersZero: isAllAnswersZero,
  };
};

const strToFunction = (fnString, getFieldValue, repeatIndex) => {
  fnString = checkDirty(fnString);
  const fnMetadata = getFnMetadata(fnString);
  const { fnBody, isAllAnswersZero } = generateFnBody(
    fnMetadata,
    getFieldValue,
    repeatIndex
  );
  return {
    fn: new Function(fnBody),
    isAllAnswersZero: isAllAnswersZero,
  };
};

const strMultilineToFunction = (fnString, getFieldValue, repeatIndex) => {
  fnString = checkDirty(fnString);
  const { fnBody, isAllAnswersZero } = generateFnBody(
    fnString,
    getFieldValue,
    repeatIndex
  );
  return {
    fn: new Function(fnBody),
    isAllAnswersZero: isAllAnswersZero,
  };
};

const AutoField = ({
  id,
  keyform,
  required,
  rules,
  addonAfter,
  addonBefore,
  fn,
  show_repeat_in_question_level,
  dependency,
  repeat,
}) => {
  const form = Form.useFormInstance();
  const { getFieldValue, setFieldsValue } = form;

  const repeatIndex = String(id).split("-")?.[1];

  const disableFieldByDependency = useMemo(() => {
    // handle the dependency for show_repeat_in_question_level
    const res = validateDisableDependencyQuestionInRepeatQuestionLevel({
      formRef: form,
      show_repeat_in_question_level,
      dependency,
      repeat,
    });
    return res;
  }, [form, show_repeat_in_question_level, dependency, repeat]);

  let automateValue = null;
  if (fn?.multiline) {
    automateValue = strMultilineToFunction(
      fn?.fnString,
      getFieldValue,
      repeatIndex
    );
  } else {
    automateValue = strToFunction(fn?.fnString, getFieldValue, repeatIndex);
  }

  useEffect(() => {
    if (automateValue && !disableFieldByDependency) {
      const { fn, isAllAnswersZero } = automateValue;
      if (checkIsPromise(fn())) {
        fn().then((res) => setFieldsValue({ [id]: res }));
      } else {
        const value = isAllAnswersZero ? null : fn();
        setFieldsValue({ [id]: value });
      }
    } else {
      setFieldsValue({ [id]: null });
    }
  }, [automateValue, id, setFieldsValue, disableFieldByDependency]);

  return (
    <Form.Item
      className="arf-field-child"
      key={keyform}
      name={id}
      rules={rules}
      required={required}
    >
      <Input
        style={{ width: "100%" }}
        addonAfter={addonAfter}
        addonBefore={addonBefore}
        disabled
      />
    </Form.Item>
  );
};

const TypeAutoField = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  fn,
  requiredSign,
  show_repeat_in_question_level,
  repeats,
  dependency,
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === "before")
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === "after")
    : [];

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <AutoField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            fn={fn}
            dependency={dependency}
            show_repeat_in_question_level={show_repeat_in_question_level}
            repeat={r}
          />
        ),
      };
    });
  }, [
    addonAfter,
    addonBefore,
    id,
    keyform,
    required,
    rules,
    repeats,
    fn,
    show_repeat_in_question_level,
    dependency,
  ]);

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

      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView id={id} dataSource={repeatInputs} />
      ) : (
        <AutoField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          fn={fn}
        />
      )}

      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} id={id} {...ex} />)}
    </Form.Item>
  );
};

export default TypeAutoField;
