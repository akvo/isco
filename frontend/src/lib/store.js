import { Store } from "pullstate";
import { generateID } from "./util";
import isoLangs from "./isoLangs";

export const defaultOption = {
  id: null,
  code: null,
  name: null,
  translations: [],
  order: 0,
};

export const defaultRepeatingObject = {
  id: generateID(),
  key: null,
  value: null,
};

export const defaultQuestionEditor = {
  id: generateID(),
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
      id: generateID(),
      order: 1,
    },
    {
      ...defaultOption,
      id: generateID(),
      order: 2,
    },
  ],
  member_access: [],
  isco_access: [],
  skip_logic: [],
};

export const defaultQuestionGroupEditor = {
  id: generateID(),
  form: null,
  name: null,
  description: null,
  translations: [],
  order: 1,
  repeat: false,
  question: [defaultQuestionEditor],
};

const defaultSurveyEditor = {
  id: generateID(),
  name: null,
  description: null,
  languages: ["en"],
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
  },
  surveyEditor: defaultSurveyEditor,
};

const store = new Store(defaultUIState);

export default store;
