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
  core_mandatory: false,
  deactivate: false,
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
  autofield: {
    multiline: false,
    fnString: null,
  },
  is_repeat_identifier: false,
};

export const defaultQuestionGroupEditor = {
  id: null,
  form: null,
  name: null,
  description: null,
  translations: [],
  order: 1,
  repeat: false,
  leading_question: null,
  isco_access: [],
  member_access: [],
  question: [],
};

const defaultSurveyEditor = {
  id: null,
  name: null,
  description: null,
  languages: ["en"],
  version: null,
  enable_prefilled_value: false,
  questionGroup: [defaultQuestionGroupEditor],
};

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  language: {
    active: "en",
    langs: { en: "English", de: "German" },
  },
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
    organisationInSameIsco: [],
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
      oncancel: () => {},
    },
    dataSecurity: {
      visible: false,
    },
  },
};

const store = new Store(defaultUIState);

export default store;
