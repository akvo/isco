import api from "./api";

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

export const passwordCheckBoxOptions = [
  { name: "Lowercase Character", re: /[a-z]/ },
  { name: "Numbers", re: /\d/ },
  { name: "Special Character", re: /[-._!"`'#%&,:;<>=@{}~$()*+/?[\]^|]/ },
  { name: "Min 8 Character", re: /[^ ]{8}/ },
];
