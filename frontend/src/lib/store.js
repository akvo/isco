import { Store } from "pullstate";
import isoLangs from "./isoLangs";

export const defaultOption = {
  id: null,
  code: null,
  name: null,
  translations: [],
  order: 1,
  flag: "post",
};

export const defaultRepeatingObject = {
  id: null,
  field: null,
  value: null,
};

export const defaultQuestionEditor = {
  id: null,
  name: null,
  translations: [],
  mandatory: false,
  datapoint_name: false,
  variabel_name: null, // custom ID
  type: "input", // question type
  personal_data: false,
  rule: {},
  tooltip: null,
  tooltip_translations: [],
  cascade: null,
  repeating_objects: [defaultRepeatingObject],
  order: 1,
  option: [
    {
      ...defaultOption,
      id: null,
      order: 1,
    },
    {
      ...defaultOption,
      id: null,
      order: 2,
    },
  ],
  member_access: [],
  isco_access: [],
  skip_logic: [],
};

export const defaultQuestionGroupEditor = {
  id: null,
  form: null,
  name: null,
  description: null,
  translations: [],
  order: 1,
  repeat: false,
  question: [],
};

const defaultSurveyEditor = {
  id: null,
  name: null,
  description: null,
  languages: ["en"],
  version: null,
  questionGroup: [defaultQuestionGroupEditor],
};

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  optionValues: {
    languages: Object.keys(isoLangs)?.map((key) => ({
      ...isoLangs[key],
      code: key,
    })),
    member_type: [],
    isco_type: [],
    question_type: [],
    operator_type: [],
    cascade: [],
    nested: [],
    repeating_object_option: [],
    organisation: [],
  },
  surveyEditor: defaultSurveyEditor,
  tempStorage: {
    deletedOptions: [],
    deletedSkipLogic: [],
  },
  isMoveQuestion: false,
  isMoveQuestionGroup: false,
  isAddQuestionGroup: false,
  notificationModal: {
    saveFormData: {
      visible: false,
      onOk: () => {},
      onCancel: () => {},
    },
  },
};

const store = new Store(defaultUIState);

export default store;
