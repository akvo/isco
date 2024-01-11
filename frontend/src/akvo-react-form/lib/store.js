import { Store } from "pullstate";

const GlobalStore = new Store({
  formConfig: { autoSave: {} },
  initialValue: [],
  isLeftDrawerVisible: false,
  current: {},
  dataPointName: [],
});

export default GlobalStore;
