import React, { useMemo } from "react";
import { Modal, Row, Col, Button, Collapse, List } from "antd";
import { uiText } from "../../static";
import { store } from "../../lib";
import intersection from "lodash/intersection";
import orderBy from "lodash/orderBy";

const { Panel } = Collapse;

const ValidationWarningModal = ({
  visible,
  onCancel,
  checkComputedValidation,
  formValue,
  checkCoreMandatoryQuestion,
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
          question: `${findQuestion.order}. ${findQuestion.name}`,
          answer: cvq.answer,
          order: findQuestion.order,
        };
      });
      let group = `${findGroup.order}. ${findGroup.name}`;
      group = findGroup?.repeatable
        ? `${group} - ${cv?.repeatIndex || 1}`
        : group;
      return {
        ...cv,
        group: group,
        questions: orderBy(questions, ["order"]),
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
      maskClosable={false}
      className="validation-popup"
    >
      {validationContent?.length ? (
        <>
          <Collapse accordion>
            {validationContent.map((vc, vci) => (
              <Panel
                header={vc.group}
                key={`vc-panel-${vc.group_id}-${vci}`}
                style={{ padding: 0 }}
              >
                <List
                  size="small"
                  header={null}
                  footer={
                    <>
                      <div>
                        {text.cvTotalValueText}
                        {` : ${vc.total}`} <br />
                      </div>
                      <div>
                        {vc.errorDetail}
                        {` : ${vc.validationValue}`}
                      </div>
                    </>
                  }
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
          <br />
        </>
      ) : (
        ""
      )}
      {checkCoreMandatoryQuestion && (
        <Row align="top" justify="space-between" gutter={[24, 24]}>
          <Col span={24} style={{ fontSize: "1rem" }}>
            {text.submitCoreMandatoryWarning}
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default ValidationWarningModal;
