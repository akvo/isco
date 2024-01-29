import React, { useMemo } from "react";
import QuestionGroupEditor from "./QuestionGroupEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";
import { minBy, orderBy, takeRight } from "lodash";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID } from "../../lib/util";

const QuestionGroup = ({ index, questionGroup }) => {
  const {
    surveyEditor,
    isMoveQuestionGroup,
    isAddQuestionGroup,
    isCopyQuestionGroup,
  } = store.useState((s) => s);
  const { id: formId, questionGroup: questionGroupState } = surveyEditor;
  console.log(isCopyQuestionGroup, "aaaa");

  const AddMoveButtonText = useMemo(() => {
    if (isMoveQuestionGroup && !isAddQuestionGroup) {
      return "Move here";
    }
    if (isCopyQuestionGroup && !isAddQuestionGroup) {
      return "Paste here";
    }
    return "Add new section";
  }, [isAddQuestionGroup, isMoveQuestionGroup, isCopyQuestionGroup]);

  const handleOnCancelMove = () => {
    store.update((s) => {
      s.isCopyQuestionGroup = false;
      s.isMoveQuestionGroup = false;
      s.isAddQuestionGroup = false;
    });
  };

  const handleAddQuestionGroupButton = (order) => {
    api
      .post(`/default_question_group/${formId}/${order}`)
      .then((res) => {
        const updatedQuestion = res.data.question.map((q) => ({
          ...q,
          // add option default
          option: [{ ...defaultOption, id: generateID() }],
          // add repeating object default
          repeating_objects: [{ ...defaultRepeatingObject, id: generateID() }],
        }));
        const data = {
          ...res.data,
          question: updatedQuestion,
        };
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
        console.error(e);
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

  const handleCopy = (targetGroupOrder) => {
    const { id: selectedGroupId, order: selectedGroupOrder } =
      isCopyQuestionGroup;
    api
      .post(
        `/copy-question-group/${selectedGroupId}/${selectedGroupOrder}/${targetGroupOrder}`
      )
      .then((res) => {
        const { data } = res;
        // GET SURVEY EDITOR INIT VALUES
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
          s.isCopyQuestionGroup = false;
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  /* get target dependencies */
  const allQuestions = questionGroupState
    .map((x) => x.question)
    .flatMap((x) => x);

  const minOrder =
    minBy(
      allQuestions.filter((x) => {
        if (isMoveQuestionGroup) {
          const skip_logics = isMoveQuestionGroup.question
            .map((x) => x.skip_logic)
            .flatMap((x) => x)
            .map((x) => x.dependent_to);
          return skip_logics.includes(x.id);
        }
        return false;
      }),
      "order"
    )?.order || 0;

  const prevQuestions = questionGroupState
    .filter((qg) => {
      if (isMoveQuestionGroup) {
        return qg.order < isMoveQuestionGroup.order;
      }
      return [];
    })
    .filter((qg) => qg.order >= questionGroup.order)
    .map((x) => x.question)
    .flatMap((x) => x);

  const prevDependencies = prevQuestions
    ? prevQuestions.filter((x) => x.order <= minOrder)
    : [];

  /* get selected dependencies */
  const nextDependencies = questionGroupState
    .filter((x) => {
      return x.order <= questionGroup.order;
    })
    .map((x) => x.question)
    .flatMap((x) => x)
    .map((x) => x.skip_logic)
    .flatMap((x) => x)
    .filter((x) =>
      isMoveQuestionGroup
        ? isMoveQuestionGroup.question
            .map((q) => q.id)
            .includes(x?.dependent_to)
        : false
    )
    .map((x) => allQuestions.find((q) => q.id === x.question))
    .filter((x) => x.question_group !== isMoveQuestionGroup?.id)
    .filter((x) => questionGroup.question.filter((q) => q.order >= x.order));

  const disabled =
    isMoveQuestionGroup.order >= questionGroup.order
      ? prevDependencies.length
      : nextDependencies.length;

  return (
    <>
      {!index &&
        (isAddQuestionGroup || isMoveQuestionGroup || isCopyQuestionGroup) && (
          <AddMoveButton
            className="question-group"
            text={AddMoveButtonText}
            cancelButton={
              isMoveQuestionGroup || isAddQuestionGroup || isCopyQuestionGroup
            }
            onCancel={handleOnCancelMove}
            disabled={
              prevDependencies.length ||
              isMoveQuestionGroup?.id === questionGroup?.id
            }
            onClick={() =>
              isAddQuestionGroup
                ? handleAddQuestionGroupButton(
                    questionGroup.order === 1
                      ? questionGroup.order
                      : questionGroup.order - 1
                  )
                : isMoveQuestionGroup
                ? handleMove(
                    questionGroup.order === 1
                      ? questionGroup.order
                      : questionGroup.order - 1,
                    questionGroup.id
                  )
                : handleCopy(
                    questionGroup.order === 1
                      ? questionGroup.order
                      : questionGroup.order - 1
                  )
            }
          />
        )}
      <QuestionGroupEditor
        index={index}
        questionGroup={questionGroup}
        isMoving={isMoveQuestionGroup?.id === questionGroup?.id}
      />
      {(isAddQuestionGroup || isMoveQuestionGroup || isCopyQuestionGroup) && (
        <AddMoveButton
          className="question-group"
          text={AddMoveButtonText}
          cancelButton={
            isMoveQuestionGroup || isAddQuestionGroup || isCopyQuestionGroup
          }
          onCancel={handleOnCancelMove}
          disabled={disabled || isMoveQuestionGroup?.id === questionGroup.id}
          onClick={() =>
            isAddQuestionGroup
              ? handleAddQuestionGroupButton(questionGroup.order + 1)
              : isMoveQuestionGroup
              ? handleMove(questionGroup.order + 1, questionGroup.id)
              : handleCopy(questionGroup.order + 1)
          }
        />
      )}
    </>
  );
};

export default QuestionGroup;
