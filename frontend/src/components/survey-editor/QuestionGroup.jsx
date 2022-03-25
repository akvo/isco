import React from "react";
import QuestionGroupEditor from "./QuestionGroupEditor";
import AddMoveButton from "./AddMoveButton";
import { store, api } from "../../lib";
import { orderBy, takeRight } from "lodash";

const QuestionGroup = ({ index, questionGroup }) => {
  const { surveyEditor, isMoveQuestionGroup } = store.useState((s) => s);
  const { id: formId, questionGroup: questionGroupState } = surveyEditor;

  const AddMoveButtonText = !isMoveQuestionGroup
    ? "Add new section"
    : "Move here";

  const handleOnCancelMove = () => {
    store.update((s) => {
      s.isMoveQuestionGroup = false;
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
        const questions = orderBy(qg.question, ["order"]).map((q, qIndex) => {
          let newOrder;
          if (selectedGroupOrder > targetGroupOrder) {
            // Not change order
            if (qg.order < targetGroupOrder || qg.order > selectedGroupOrder) {
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
                questionGroupState.find((x) => x.id === targetGroupId).question,
                1
              )[0].order;
              newOrder = qIndex + prevQuestionOrder + 1;
            }
          }
          if (selectedGroupOrder < targetGroupOrder) {
            // Not change order
            if (qg.order < selectedGroupOrder || qg.order >= targetGroupOrder) {
              newOrder = q.order;
            }
            // Change order between selectedGroupOrder & targetGroupOrder
            if (qg.order < targetGroupOrder && qg.order >= selectedGroupOrder) {
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
                    g.order > selectedGroupOrder && g.order < targetGroupOrder
                )
                .flatMap((q) => q.question).length;
              newOrder = q.order + movedTargetGroupQuestionLength;
            }
          }
          return {
            ...q,
            order: newOrder,
          };
        });
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
  };

  return (
    <>
      {!index && (
        <AddMoveButton
          className="question-group"
          text={AddMoveButtonText}
          cancelButton={isMoveQuestionGroup}
          onCancel={handleOnCancelMove}
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
      <QuestionGroupEditor index={index} questionGroup={questionGroup} />
      <AddMoveButton
        className="question-group"
        text={AddMoveButtonText}
        cancelButton={isMoveQuestionGroup}
        onCancel={handleOnCancelMove}
        onClick={() =>
          !isMoveQuestionGroup
            ? handleAddQuestionGroupButton(questionGroup.order + 1)
            : handleMove(questionGroup.order + 1, questionGroup.id)
        }
      />
    </>
  );
};

export default QuestionGroup;
