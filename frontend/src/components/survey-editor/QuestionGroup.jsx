import React from "react";
import QuestionGroupEditor from "./QuestionGroupEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";

const QuestionGroup = ({ index, questionGroup }) => {
  const { surveyEditor, isMoveQuestionGroup } = store.useState((s) => s);
  const { id: formId, questionGroup: questionGroupState } = surveyEditor;

  const AddMoveButtonText = !isMoveQuestionGroup
    ? "Add new section"
    : "Move here";

  const handleAddQuestionGroupButton = (order) => {
    api
      .post(`/default_question_group/${formId}/${order}`)
      .then((res) => {
        const { data } = res;
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          const newOrder = qg.order >= order ? qg.order + 1 : qg.order;
          return { ...qg, order: newOrder };
        });
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: [...updatedQuestionGroup, data],
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  return (
    <>
      {!index && (
        <AddMoveButton
          className="question-group"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestionGroup}
          // onCancel={handleOnCancelMove}
          onClick={() =>
            handleAddQuestionGroupButton(
              questionGroup.order === 1
                ? questionGroup.order
                : questionGroup.order - 1
            )
          }
        />
      )}
      <QuestionGroupEditor index={index} questionGroup={questionGroup} />
      <AddMoveButton
        className="question-group"
        text={AddMoveButtonText}
        cancelButton={isMoveQuestionGroup}
        // onCancel={handleOnCancelMove}
        onClick={() => handleAddQuestionGroupButton(questionGroup.order + 1)}
      />
    </>
  );
};

export default QuestionGroup;
