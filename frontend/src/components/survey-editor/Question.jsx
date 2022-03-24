import React from "react";
import QuestionEditor from "./QuestionEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID } from "../../lib/util";

const Question = ({
  index,
  form,
  question,
  questionGroup,
  handleFormOnValuesChange,
  submitStatus,
  setSubmitStatus,
}) => {
  const { surveyEditor, isMoveQuestion } = store.useState((s) => s);
  const { questionGroup: questionGroupState } = surveyEditor;

  const AddMoveButtonText = !isMoveQuestion ? "Add new question" : "Move here";

  const handleOnCancelMove = () => {
    store.update((s) => {
      s.isMoveQuestion = false;
    });
  };

  const handleAddQuestionButton = (order) => {
    const qgId = questionGroup?.id;
    api
      .post(`/default_question/${surveyEditor.id}/${qgId}/${order}`)
      .then((res) => {
        const { data } = res;
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          let questions = qg.question.map((q) => {
            const newOrder = q.order >= order ? q.order + 1 : q.order;
            return {
              ...q,
              order: newOrder,
            };
          });
          if (qg.id === qgId) {
            questions = [
              ...questions,
              {
                ...data,
                // add option default
                option: [{ ...defaultOption, id: generateID() }],
                // add repeating object default
                repeating_objects: [
                  { ...defaultRepeatingObject, id: generateID() },
                ],
              },
            ];
          }
          return {
            ...qg,
            question: questions,
          };
        });
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: updatedQuestionGroup,
          };
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleMove = (currentOrder) => {
    const { id, order } = isMoveQuestion;
    api
      .put(`/move-question/${id}/${order}/${currentOrder}`)
      .then(() => {
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          const questions = qg.question.map((q) => {
            const newOrder =
              q.order >= currentOrder && q.order !== order && q.order < order
                ? q.order + 1
                : q.order === order
                ? currentOrder
                : q.order;
            return {
              ...q,
              order: newOrder,
            };
          });
          return {
            ...qg,
            question: questions,
          };
        });
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: updatedQuestionGroup,
          };
          s.isMoveQuestion = false;
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <>
      {!index && (
        <AddMoveButton
          text={AddMoveButtonText}
          cancelButton={isMoveQuestion}
          onCancel={handleOnCancelMove}
          onClick={() =>
            !isMoveQuestion
              ? handleAddQuestionButton(
                  question.order === 1 ? question.order : question.order - 1
                )
              : handleMove(
                  question.order === 1 ? question.order : question.order - 1
                )
          }
        />
      )}
      <QuestionEditor
        index={index}
        form={form}
        question={question}
        questionGroup={questionGroup}
        handleFormOnValuesChange={handleFormOnValuesChange}
        submitStatus={submitStatus}
        setSubmitStatus={setSubmitStatus}
      />
      <AddMoveButton
        text={AddMoveButtonText}
        cancelButton={isMoveQuestion}
        onCancel={handleOnCancelMove}
        onClick={() =>
          !isMoveQuestion
            ? handleAddQuestionButton(question.order + 1)
            : handleMove(question.order + 1)
        }
      />
    </>
  );
};

export default Question;
