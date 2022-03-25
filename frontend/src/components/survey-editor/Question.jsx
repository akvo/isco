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

  const handleMove = (targetOrder, targetQuestionGroup) => {
    const {
      id: selectedQuestion,
      order: selectedOrder,
      question_group: selectedQuestionGroup,
    } = isMoveQuestion;
    const isMovedToOtherGroup = selectedQuestionGroup !== targetQuestionGroup;
    api
      .put(
        `/move-question/${selectedQuestion}/${selectedOrder}/${targetOrder}?target_group=${targetQuestionGroup}`
      )
      .then(() => {
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          let questions = qg.question;
          // remove question from selected
          if (isMovedToOtherGroup && qg.id === selectedQuestionGroup) {
            questions = questions.filter((q) => q.id !== selectedQuestion);
          }
          // add question to target
          if (isMovedToOtherGroup && qg.id === targetQuestionGroup) {
            questions = [
              ...questions,
              { ...isMoveQuestion, question_group: targetQuestionGroup },
            ];
          }
          questions = questions.map((q) => {
            let newOrder = q.order;
            if (selectedOrder > targetOrder) {
              newOrder =
                q.order >= targetOrder &&
                q.order !== selectedOrder &&
                q.order < selectedOrder
                  ? q.order + 1
                  : q.order === selectedOrder
                  ? targetOrder
                  : q.order;
            }
            if (selectedOrder < targetOrder) {
              newOrder =
                q.order > selectedOrder &&
                q.order < targetOrder &&
                q.order !== selectedOrder
                  ? q.order - 1
                  : q.order === selectedOrder
                  ? targetOrder - 1
                  : q.order;
            }
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

  // const disabled = isMoveQuestion.skip_logic?.filter((val) => {
  //   return val.dependent_to <= question.id;
  // }).length;
  // console.log(disabled);

  return (
    <>
      {!index && (
        <AddMoveButton
          className="question"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestion}
          onCancel={handleOnCancelMove}
          onClick={() =>
            !isMoveQuestion
              ? handleAddQuestionButton(
                  question.order === 1 ? question.order : question.order - 1
                )
              : handleMove(
                  question.order === 1 ? question.order : question.order - 1,
                  question.question_group
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
        className="question"
        text={AddMoveButtonText}
        cancelButton={isMoveQuestion}
        onCancel={handleOnCancelMove}
        onClick={() =>
          !isMoveQuestion
            ? handleAddQuestionButton(question.order + 1)
            : handleMove(question.order + 1, question.question_group)
        }
      />
    </>
  );
};

export default Question;
