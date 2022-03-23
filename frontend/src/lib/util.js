import api from "./api";
import { orderBy, take } from "lodash";

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

export const generateQuestionCurrentOrder = (form) => {
  const transform = orderBy(form?.questionGroup, ["order"])
    ?.map((qg, qgi) => {
      const currentOrder = take(form?.questionGroup, qgi).flatMap(
        (q) => q?.question
      ).length;
      return {
        ...qg,
        question: qg.question.map((q) => ({
          ...q,
          currentOrder: currentOrder + q.order,
        })),
      };
    })
    ?.map((qg) => ({ ...qg, question: orderBy(qg?.question, ["order"]) }));
  return {
    ...form,
    questionGroup: transform,
  };
};
