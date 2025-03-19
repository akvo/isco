import api from "./api";
import { intersection, orderBy, groupBy } from "lodash";

export const generateID = () => {
  return Math.floor(100000000 + Math.random() * 900000000);
};

export const insert = (arr, index, ...newItems) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted items
  ...newItems,
  // part of the array after the specified index
  ...arr.slice(index),
];

export const deleteQuestionOption = (deletedOptions, questionId = null) => {
  let optionToDelete = deletedOptions;
  if (questionId) {
    optionToDelete = optionToDelete?.filter((x) => x?.question === questionId);
  }
  optionToDelete?.forEach((opt) => {
    const { id } = opt;
    api.delete(`/option/${id}`).catch((e) => {
      const { status, statusText } = e.response;
      console.error(status, statusText);
    });
  });
  return;
};

export const deleteQuestionSkipLogic = (
  deletedSkipLogic,
  questionId = null
) => {
  let toDelete = deletedSkipLogic;
  if (questionId) {
    toDelete = toDelete?.filter((x) => x?.question === questionId);
  }
  toDelete?.forEach((item) => {
    const { id } = item;
    api.delete(`/skip_logic/${id}`).catch((e) => {
      const { status, statusText } = e.response;
      console.error(status, statusText);
    });
  });
  return;
};

export const passwordCheckBoxOptions = (text) => {
  const { lowercaseCharText, numberCharText, specialCharText, eightCharText } =
    text;
  return [
    { name: lowercaseCharText, re: /[a-z]/ },
    { name: numberCharText, re: /\d/ },
    { name: specialCharText, re: /[-._!"`'#%&,:;<>=@{}~$()*+/?[\]^|]/ },
    { name: eightCharText, re: /[^ ]{8}/ },
  ];
};

export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const globalSelectProps = {
  allowClear: true,
  dropdownStyle: {
    overflowY: "scroll",
  },
};

export const globalMultipleSelectProps = {
  allowClear: false,
  dropdownStyle: {
    overflowY: "scroll",
  },
};

export const reorderAnswersRepeatIndex = (formValue, answer) => {
  // reordered repeat index answer
  const repeatQuestions = formValue.question_group
    .filter((qg) => qg.repeatable)
    .flatMap((qg) => qg.question)
    .map((q) => q.id);
  const nonRepeatValues = answer.filter(
    (x) => !intersection([x.question], repeatQuestions).length
  );
  const repeatValues = answer.filter(
    (x) => intersection([x.question], repeatQuestions).length
  );

  // Group by repeat_index
  const grouped = groupBy(repeatValues, "repeat_index");
  // Sort groups by original repeat_index
  const sortedGroups = orderBy(Object.entries(grouped), ([index]) =>
    Number(index)
  );
  const reorderedRepeatIndex = repeatQuestions
    .map((id) => {
      // Reassign repeat_index sequentially
      const reorderedData = sortedGroups.flatMap(([, group], newIndex) =>
        group
          .filter((x) => x.question === id)
          .map((v) => ({
            ...v,
            repeat_index:
              !isNumeric(v.repeat_index) && v?.repeat_index_string
                ? v.repeat_index_string
                : newIndex,
          }))
      );
      return reorderedData;
    })
    .flatMap((x) => x);
  return nonRepeatValues.concat(reorderedRepeatIndex);
  // end  of reorder repeat index
};
