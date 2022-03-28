import React from "react";
import QuestionGroupEditor from "./QuestionGroupEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";
import { orderBy, takeRight, intersection } from "lodash";

const QuestionGroup = ({ index, questionGroup }) => {
  const { surveyEditor, isMoveQuestionGroup, isAddQuestionGroup } =
    store.useState((s) => s);
  const { id: formId, questionGroup: questionGroupState } = surveyEditor;

  const AddMoveButtonText = !isMoveQuestionGroup
    ? "Add new section"
    : "Move here";

  const handleOnCancelMove = () => {
    store.update((s) => {
      s.isMoveQuestionGroup = false;
      s.isAddQuestionGroup = false;
    });
  };

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
          s.isAddQuestionGroup = false;
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  };

  const handleMove = (targetGroupOrder, targetGroupId) => {
    const { id: selectedGroupId, order: selectedGroupOrder } =
      isMoveQuestionGroup;
    api
      .put(
        `/move-question-group/${selectedGroupId}/${selectedGroupOrder}/${targetGroupOrder}?target_id=${targetGroupId}`
      )
      .then(() => {
        const updatedQuestionGroup = orderBy(questionGroupState, ["order"]).map(
          (qg) => {
            // Block update question group order
            let newGroupOrder = qg.order;
            if (selectedGroupOrder > targetGroupOrder) {
              newGroupOrder =
                qg.order >= targetGroupOrder &&
                qg.order < selectedGroupOrder &&
                qg.order !== selectedGroupOrder
                  ? qg.order + 1
                  : qg.order === selectedGroupOrder
                  ? targetGroupOrder
                  : qg.order;
            }
            if (selectedGroupOrder < targetGroupOrder) {
              newGroupOrder =
                qg.order > selectedGroupOrder &&
                qg.order < targetGroupOrder &&
                qg.order !== selectedGroupOrder
                  ? qg.order - 1
                  : qg.order === selectedGroupOrder
                  ? targetGroupOrder - 1
                  : qg.order;
            }
            // End block update question group order

            // Block update question order
            const questions = orderBy(qg.question, ["order"]).map(
              (q, qIndex) => {
                let newOrder;
                if (selectedGroupOrder > targetGroupOrder) {
                  // Not change order
                  if (
                    qg.order < targetGroupOrder ||
                    qg.order > selectedGroupOrder
                  ) {
                    newOrder = q.order;
                  }
                  // Change order between selectedGroupOrder & targetGroupOrder
                  if (
                    qg.order <= selectedGroupOrder &&
                    qg.order >= targetGroupOrder
                  ) {
                    const selectedGroupQuestionLength = questionGroupState.find(
                      (x) => x.id === selectedGroupId
                    ).question.length;
                    newOrder = q.order + selectedGroupQuestionLength;
                  }
                  // Change order for moved group question
                  if (qg.order === selectedGroupOrder) {
                    const prevQuestionOrder = takeRight(
                      questionGroupState.find((x) => x.id === targetGroupId)
                        .question,
                      1
                    )[0].order;
                    newOrder =
                      targetGroupOrder <= 1
                        ? qIndex + 1
                        : qIndex + prevQuestionOrder + 1;
                  }
                }
                if (selectedGroupOrder < targetGroupOrder) {
                  // Not change order
                  if (
                    qg.order < selectedGroupOrder ||
                    qg.order >= targetGroupOrder
                  ) {
                    newOrder = q.order;
                  }
                  // Change order between selectedGroupOrder & targetGroupOrder
                  if (
                    qg.order < targetGroupOrder &&
                    qg.order >= selectedGroupOrder
                  ) {
                    const targetGroupQuestionLength = questionGroupState.find(
                      (x) => x.id === selectedGroupId
                    ).question.length;
                    newOrder = q.order - targetGroupQuestionLength;
                  }
                  // Change order for moved group question
                  if (qg.order === selectedGroupOrder) {
                    const movedTargetGroupQuestionLength = questionGroupState
                      ?.filter(
                        (g) =>
                          g.order > selectedGroupOrder &&
                          g.order < targetGroupOrder
                      )
                      .flatMap((q) => q.question).length;
                    newOrder = q.order + movedTargetGroupQuestionLength;
                  }
                }
                return {
                  ...q,
                  order: newOrder,
                };
              }
            );
            // End block update question order
            return {
              ...qg,
              order: newGroupOrder,
              question: questions,
            };
          }
        );
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            questionGroup: updatedQuestionGroup,
          };
          s.isMoveQuestionGroup = false;
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const allPrevQuestions = questionGroupState
    .filter((x) => x.order > questionGroup.order)
    .map((x) => x.question)
    .flatMap((x) => x);

  const allPrevDependencies = allPrevQuestions.filter((x) => {
    if (isMoveQuestionGroup) {
      const skip_logics = isMoveQuestionGroup.question
        .filter((q) => q.skip_logic.length)
        .flatMap((q) => q)
        .map((q) => q.skip_logic)
        .flatMap((q) => q)
        .map((q) => q.dependent_to);
      return skip_logics.includes(x.id);
    }
    return false;
  });

  const disable = questionGroup.question.filter((x) => {
    const hasHighOrder = allPrevDependencies.map((d) => d.order >= x.order);
    return hasHighOrder.length;
  });

  const allTargetDependencies = questionGroupState
    .filter((x) => {
      if (isMoveQuestionGroup?.id !== questionGroup.id) {
        return x.order <= questionGroup.order;
      }
      return false;
    })
    .map((x) => x.question)
    .flatMap((x) => x)
    .map((x) => x.skip_logic)
    .flatMap((x) => x)
    .filter((x) =>
      isMoveQuestionGroup
        ? isMoveQuestionGroup.question.map((q) => q.id).includes(x.dependent_to)
        : false
    );

  return (
    <>
      {!index && (isAddQuestionGroup || isMoveQuestionGroup) && (
        <AddMoveButton
          className="question-group"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestionGroup || isAddQuestionGroup}
          onCancel={handleOnCancelMove}
          disabled={
            disable.length || isMoveQuestionGroup?.order === questionGroup?.id
          }
          onClick={() =>
            !isMoveQuestionGroup
              ? handleAddQuestionGroupButton(
                  questionGroup.order === 1
                    ? questionGroup.order
                    : questionGroup.order - 1
                )
              : handleMove(
                  questionGroup.order === 1
                    ? questionGroup.order
                    : questionGroup.order - 1,
                  questionGroup.id
                )
          }
        />
      )}
      <QuestionGroupEditor
        index={index}
        questionGroup={questionGroup}
        isMoving={isMoveQuestionGroup?.id === questionGroup?.id}
      />
      {(isAddQuestionGroup || isMoveQuestionGroup) && (
        <AddMoveButton
          className="question-group"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestionGroup || isAddQuestionGroup}
          onCancel={handleOnCancelMove}
          disabled={
            disable.length ||
            allTargetDependencies.length ||
            isMoveQuestionGroup?.id === questionGroup.id ||
            isMoveQuestionGroup?.order - 1 === questionGroup.order
          }
          onClick={() =>
            !isMoveQuestionGroup
              ? handleAddQuestionGroupButton(questionGroup.order + 1)
              : handleMove(questionGroup.order + 1, questionGroup.id)
          }
        />
      )}
    </>
  );
};

export default QuestionGroup;
