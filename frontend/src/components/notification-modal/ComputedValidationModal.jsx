import React, { useMemo } from "react";
import { Modal, Row, Button, Collapse, List } from "antd";
import { uiText } from "../../static";
import { store } from "../../lib";
import intersection from "lodash/intersection";

const { Panel } = Collapse;

const ComputedValidationModal = ({
  visible,
  onCancel,
  checkComputedValidation,
  formValue,
}) => {
  const { active: activeLang } = store.useState((s) => s.language);

  const questionGroups = useMemo(() => {
    if (!formValue?.question_group) {
      return [];
    }
    return formValue.question_group.map((qg) => {
      const question_ids = qg.question.map((q) => q.id);
      return {
        ...qg,
        question_ids: question_ids,
      };
    });
  }, [formValue]);

  const validationContent = useMemo(() => {
    if (!questionGroups.length) {
      return [];
    }
    const res = checkComputedValidation.map((cv) => {
      const findGroup = questionGroups.find(
        (qg) =>
          qg?.id === cv.group_id ||
          intersection(qg.question_ids, cv.question_ids)?.length
      );
      const questions = cv.questions.map((cvq) => {
        const findQuestion = findGroup.question.find((q) => q.id === cvq.id);
        return {
          id: cvq.id,
          question: ` ${findQuestion.order}. ${findQuestion.name}`,
          answer: cvq.answer,
        };
      });
      return {
        ...cv,
        group: `${findGroup.order}. ${findGroup.name}`,
        questions: questions,
      };
    });
    return res;
  }, [checkComputedValidation, questionGroups]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <Modal
      title={text.cvModalTitleText}
      visible={visible}
      width="600px"
      centered
      destroyOnClose
      onCancel={onCancel}
      footer={
        <Row align="middle" justify="center">
          <Button onClick={onCancel}>{text.btnClose}</Button>
        </Row>
      }
    >
      <Collapse accordion>
        {validationContent.map((vc) => (
          <Panel
            header={vc.group}
            key={`vc-panel-${vc.group_id}`}
            style={{ padding: 0 }}
          >
            <List
              size="small"
              header={null}
              footer={`${text.cvTotalValueText} : ${vc.total} | ${vc.errorDetail} : ${vc.validationValue}`}
              dataSource={vc.questions}
              renderItem={(item) => (
                <List.Item
                  key={`list-item-${item.id}`}
                >{`${item.question} : ${item.answer}`}</List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </Modal>
  );
};

export default ComputedValidationModal;
