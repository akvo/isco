import React, { useMemo } from "react";
import QuestionEditor from "./QuestionEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID } from "../../lib/util";
import { useNotification } from "../../util";

const copyToastText =
  "Only the question contents have been copied. Please re-configure the dependencies, if any for the new questions.";

const Question = ({
  index,
  form,
  question,
  questionGroup,
  handleFormOnValuesChange,
  submitStatus,
  setSubmitStatus,
  questionToDeactivate,
  setQuestionToDeactivate,
}) => {
  const { surveyEditor, isMoveQuestion, isCopyQuestion } = store.useState(
    (s) => s
  );
  const { questionGroup: questionGroupState } = surveyEditor;
  const { notify } = useNotification();

  const AddMoveButtonText = useMemo(() => {
    if (isMoveQuestion) {
      return "Move here";
    }
    if (isCopyQuestion) {
      return "Paste here";
    }
    return "Add new question";
  }, [isMoveQuestion, isCopyQuestion]);

  const handleOnCancelMove = () => {
    store.update((s) => {
      s.isCopyQuestion = false;
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
                // add autofiield default
                autofield: {
                  multiline: false,
                  fnString: null,
                },
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
      id: selectedQuestionId,
      order: selectedOrder,
      question_group: selectedQuestionGroup,
    } = isMoveQuestion;
    const isMovedToOtherGroup = selectedQuestionGroup !== targetQuestionGroup;
    api
      .put(
        `/move-question/${selectedQuestionId}/${selectedOrder}/${targetOrder}?target_group=${targetQuestionGroup}`
      )
      .then(() => {
        const updatedQuestionGroup = questionGroupState.map((qg) => {
          let questions = qg.question;
          // remove question from selected
          if (isMovedToOtherGroup && qg.id === selectedQuestionGroup) {
            questions = questions.filter((q) => q.id !== selectedQuestionId);
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

  const handleCopy = (targetOrder, targetQuestionGroup) => {
    const { id: selectedQuestionId } = isCopyQuestion;
    api
      .post(
        `/copy-question/${selectedQuestionId}/${targetQuestionGroup}/${targetOrder}`
      )
      .then((res) => {
        const { data } = res;
        notify({
          type: "success",
          message: copyToastText,
        });
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: data?.question_group?.map((qg) => {
              // check for disableDelete a group based on question disableDelete value
              const questionDisableDelete = qg?.question?.filter(
                (q) => q?.disableDelete
              );
              return {
                ...qg,
                disableDelete: questionDisableDelete?.length ? true : false,
                question: qg?.question?.map((q) => {
                  let option = q?.option;
                  let repeating_objects = q?.repeating_objects;
                  // add option default
                  if (option?.length === 0) {
                    option = [{ ...defaultOption, id: generateID() }];
                  }
                  // add repeating object default
                  if (!repeating_objects || repeating_objects?.length === 0) {
                    repeating_objects = [
                      { ...defaultRepeatingObject, id: generateID() },
                    ];
                  }
                  return {
                    ...q,
                    option: option,
                    repeating_objects: repeating_objects,
                  };
                }),
              };
            }),
          };
          s.isCopyQuestion = false;
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const allQuestions = questionGroupState
    .map((x) => x.question)
    .flatMap((x) => x);

  const allPrevDependencies = allQuestions.filter((x) => {
    if (isMoveQuestion) {
      return isMoveQuestion.skip_logic
        .map((s) => s.dependent_to)
        .includes(x.id);
    }
    return false;
  });

  const prevDependencies = allPrevDependencies.filter((x) => {
    return x.order > question.order;
  });

  const topButtonDependencies = allPrevDependencies.filter((x) => {
    return x.order >= question.order;
  });

  const nextDependencies = allQuestions
    .filter((x) => {
      if (isMoveQuestion) {
        return x.order > isMoveQuestion.order && x.skip_logic.length;
      }
      return false;
    })
    .filter((x) => x.order <= question.order)
    .map((x) => x.skip_logic.map((s) => ({ ...s, order: x.order })))
    .flatMap((x) => x)
    .filter((x) => x.dependent_to === isMoveQuestion?.id);

  const disable =
    question.order <= isMoveQuestion?.order
      ? prevDependencies
      : nextDependencies;

  return (
    <>
      {!index && (
        <AddMoveButton
          className="question"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestion || isCopyQuestion}
          onCancel={handleOnCancelMove}
          disabled={
            topButtonDependencies.length || isMoveQuestion?.id === question?.id
          }
          onClick={() =>
            !isMoveQuestion && !isCopyQuestion
              ? handleAddQuestionButton(
                  question.order === 1 ? question.order : question.order - 1
                )
              : !isCopyQuestion
              ? handleMove(
                  question.order === 1 ? question.order : question.order - 1,
                  question.question_group
                )
              : handleCopy(question.order, question.question_group)
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
        toggleMove={isMoveQuestion?.id || isCopyQuestion?.id}
        questionToDeactivate={questionToDeactivate}
        setQuestionToDeactivate={setQuestionToDeactivate}
      />
      <AddMoveButton
        className="question"
        text={AddMoveButtonText}
        cancelButton={isMoveQuestion || isCopyQuestion}
        onCancel={handleOnCancelMove}
        disabled={disable.length || isMoveQuestion?.id === question?.id}
        onClick={() =>
          !isMoveQuestion && !isCopyQuestion
            ? handleAddQuestionButton(question.order + 1)
            : !isCopyQuestion
            ? handleMove(question.order + 1, question.question_group)
            : handleCopy(question.order + 1, question.question_group)
        }
      />
    </>
  );
};

export default Question;
