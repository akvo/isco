import React from "react";
import QuestionDetail from "./QuestionDetail";
import QuestionSetting from "./QuestionSetting";
import QuestionTranslation from "./QuestionTranslation";

const QuestionTabContent = ({
  form,
  activeSetting,
  questionGroup,
  question,
  handleFormOnValuesChange,
  setAllowOther,
  allowOther,
  allowDecimal,
  setAllowDecimal,
  mandatory,
  setMandatory,
  personalData,
  setPersonalData,
  activeLang,
  setActiveLang,
  coreMandatory,
  setCoreMandatory,
  questionToDeactivate,
  setQuestionToDeactivate,
  datapointName,
  setDatapointName,
}) => {
  switch (activeSetting) {
    case "translation":
      return (
        <QuestionTranslation
          questionGroup={questionGroup}
          question={question}
          activeLang={activeLang}
          setActiveLang={setActiveLang}
        />
      );
    case "setting":
      return (
        <QuestionSetting
          form={form}
          questionGroup={questionGroup}
          question={question}
          mandatory={mandatory}
          setMandatory={setMandatory}
          allowDecimal={allowDecimal}
          setAllowDecimal={setAllowDecimal}
          personalData={personalData}
          setPersonalData={setPersonalData}
          handleFormOnValuesChange={handleFormOnValuesChange}
          coreMandatory={coreMandatory}
          setCoreMandatory={setCoreMandatory}
          questionToDeactivate={questionToDeactivate}
          setQuestionToDeactivate={setQuestionToDeactivate}
          datapointName={datapointName}
          setDatapointName={setDatapointName}
        />
      );
    default:
      return (
        <QuestionDetail
          form={form}
          questionGroup={questionGroup}
          question={question}
          handleFormOnValuesChange={handleFormOnValuesChange}
          allowOther={allowOther}
          setAllowOther={setAllowOther}
        />
      );
  }
};

export default QuestionTabContent;
