import { Store } from "pullstate";
import { v4 as uuidv4 } from "uuid";

export const defaultOption = {
  id: null,
  code: null,
  name: null,
  translations: [],
  order: 0,
};

export const defaultQuestionEditor = {
  id: uuidv4(),
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
  repeating_objects: [],
  order: 1,
  option: [
    {
      id: uuidv4(),
      code: null,
      name: null,
      translations: [],
      order: 1,
    },
    {
      id: uuidv4(),
      code: null,
      name: null,
      translations: [],
      order: 2,
    },
  ],
  member_access: [],
  isco_access: [],
  skip_logic: [],
};

export const defaultQuestionGroupEditor = {
  id: uuidv4(),
  form: null,
  name: null,
  description: null,
  translations: [],
  order: 1,
  repeat: false,
  question: [defaultQuestionEditor],
};

const defaultSurveyEditor = {
  id: uuidv4(),
  name: null,
  description: null,
  languages: ["en"],
  questionGroup: [defaultQuestionGroupEditor],
};

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  surveyEditor: defaultSurveyEditor,
};

const store = new Store(defaultUIState);

export default store;
