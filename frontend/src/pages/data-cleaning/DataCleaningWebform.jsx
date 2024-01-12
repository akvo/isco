import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Button, Space, Spin, Modal } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty, orderBy } from "lodash";
import { CommentField } from "../../components";
import { Webform } from "../../akvo-react-form";
import { uiText } from "../../static";

const reorderAnswersRepeatIndex = (formValue, answer) => {
  // reordered repeat index answer
  const repeatQuestions = formValue.question_group
    .filter((qg) => qg.repeatable)
    .flatMap((qg) => qg.question)
    .map((q) => q.id);
  const nonRepeatValues = answer.filter(
    (x) => !intersection([x.question], repeatQuestions).length
  );
  const repeatValues = answer.filter(
    (x) => intersection([x.question], repeatQuestions).length
  );
  const reorderedRepeatIndex = repeatQuestions
    .map((id) => {
      return orderBy(repeatValues, ["repeat_index"])
        .filter((x) => x.question === id)
        .map((v, vi) => ({
          ...v,
          repeat_index: vi,
        }));
    })
    .flatMap((x) => x);
  return nonRepeatValues.concat(reorderedRepeatIndex);
  // end  of reorder repeat index
};

const checkDependentValue = (formValue, answer) => {
  const questions = formValue.question_group.flatMap((qg) => qg.question);
  const dependencies = questions
    .filter((q) => q?.dependency)
    .map((q) => {
      const dependency = q.dependency.map((d) => {
        const question = questions.find((q) => q.id === d.id);
        return {
          ...d,
          qtype: question?.type ? question.type : null,
        };
      });
      return {
        qid: q.id,
        dependency: dependency,
      };
    });
  // transform answer
  if (answer && answer.length) {
    const transformAnswer = answer.filter((a) => {
      const findDependency = dependencies.find((q) => q.qid === a.question);
      if (findDependency) {
        // check dependency answer
        const check = findDependency.dependency.map((d) => {
          const dependentToAnswer = answer.find((x) => x.question === d.id);
          if (!dependentToAnswer || !dependentToAnswer?.value) {
            return false;
          }
          let value = dependentToAnswer.value;
          if (d?.options) {
            if (typeof value === "string") {
              value = [value];
            }
            return intersection(d.options, value)?.length > 0;
          }
          if (d?.min) {
            return value >= d.min;
          }
          if (d?.max) {
            return value <= d.max;
          }
          if (d?.equal) {
            return value === d.equal;
          }
          if (d?.notEqual) {
            return value !== d.notEqual && !!value;
          }
        });
        if (intersection(check, [false])?.length > 0) {
          return false;
        }
        return true;
      }
      return true;
    });
    return transformAnswer;
  }
  return answer;
};

const DataCleaningWebform = ({ datapoint, orgDetail, handleBack }) => {
  const { notify } = useNotification();

  const allAccess = "All";
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const [formValue, setFormValue] = useState({});
  const [answer, setAnswer] = useState([]);

  const [comment, setComment] = useState({});
  const [deletedComment, setDeletedComment] = useState(null);

  const [isForce, setIsForce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  // save savedData here, for loaded form this must be saved when loading form value
  const [savedData, setSavedData] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState([]);

  // warning modal
  const [modalWarningVisible, setModalWarningVisible] = useState(false);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  // transform & filter form definition
  useEffect(() => {
    if (datapoint?.form && orgDetail?.id) {
      const { member: orgMember, isco: orgIsco } = orgDetail;
      const url = `/webform/${datapoint.form}?data_id=${datapoint.id}&data_cleaning=1`;
      api
        .get(url)
        .then((res) => {
          const { data, status } = res;
          const { form, initial_values } = data;
          if (status === 200) {
            let commentValues = {};
            // load initial form value from saved data
            if (initial_values && isEmpty(answer)) {
              setSavedData(initial_values);
              const answers = initial_values.answer.map((a) => {
                const { question, repeat_index, comment } = a;
                commentValues = {
                  ...commentValues,
                  [question]: comment,
                };
                return {
                  ...a,
                  repeatIndex: repeat_index,
                };
              });
              setInitialAnswers(answers);
              setAnswer(answers);
              setComment(commentValues);
            }
            // load initial value when user change translations
            if (!isEmpty(answer)) {
              setInitialAnswers(answer);
              answer.forEach((a) => {
                commentValues = {
                  ...commentValues,
                  [a.question]: a.comment,
                };
              });
              setComment(commentValues);
            }
            // transform form definition
            let transformedQuestionGroup = form.question_group;
            // enable comment field
            transformedQuestionGroup = transformedQuestionGroup.map((qg) => {
              let updatedQuestions = qg.question.map((q) => {
                let extra = [
                  {
                    placement: "after",
                    content: (
                      <CommentField
                        qid={q.id}
                        onChange={(val) => onChangeComment(q.id, val)}
                        onDelete={() => onDeleteComment(q.id)}
                        // value={
                        //   commentValues?.[q.id] ? commentValues?.[q.id] : null
                        // }
                      />
                    ),
                  },
                ];
                if (q?.extra) {
                  extra = [...extra, q.extra];
                }
                return {
                  ...q,
                  extra: extra,
                };
              });
              // Filter survey detail by user login, using member/isco name
              if (orgMember) {
                updatedQuestions = updatedQuestions.filter(
                  (q) =>
                    intersection(q.member_access, orgMember).length ||
                    q.member_access.includes(allAccess)
                );
              }
              if (!isEmpty(orgIsco)) {
                updatedQuestions = updatedQuestions.filter(
                  (q) =>
                    intersection(q.isco_access, orgIsco).length ||
                    q.isco_access.includes(allAccess)
                );
              }
              return {
                ...qg,
                question: updatedQuestions,
              };
            });
            /** filter group which doesn't have questions
             * after question filtered by member/isco access */
            transformedQuestionGroup = transformedQuestionGroup.filter(
              (qg) => qg.question.length
            );
            setFormValue({
              ...form,
              defaultLanguage: activeLang || "en",
              question_group: transformedQuestionGroup,
            });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang /*orgDetail, datapoint, answer*/]);

  // set default language
  useEffect(() => {
    if (activeLang) {
      setFormValue({});
    }
  }, [activeLang]);

  // set comment to answer value
  useEffect(() => {
    if (!isEmpty(comment) && answer.length) {
      const qid = parseInt(Object.keys(comment)[0]);
      const findAnswer = answer.find((x) => parseInt(x.question) === qid);
      if (findAnswer) {
        // update answer
        const updatedAnswer = answer.map((a) => {
          let update = a;
          if (a.question === qid) {
            update = {
              ...update,
              comment: comment?.[qid] || null,
            };
          }
          return update;
        });
        setAnswer(updatedAnswer);
        setComment({});
      }
    }
  }, [comment, answer]);

  // delete comment
  useEffect(() => {
    if (deletedComment && answer.length) {
      const findAnswer = answer.find((x) => x.question === deletedComment);
      if (findAnswer) {
        // update answer
        const updatedAnswer = answer.map((a) => {
          let update = a;
          if (a.question === deletedComment) {
            update = {
              ...update,
              comment: null,
            };
          }
          return update;
        });
        setAnswer(updatedAnswer);
        setDeletedComment(null);
      }
    }
  }, [deletedComment, answer]);

  const onChange = ({ /*current*/ values /*progress*/ }) => {
    // handle data unavailable checkbox - comment
    const dataUnavailable = Object.keys(values)
      .filter((key) => key.includes("na"))
      .map((key) => {
        const elCheckUnavailable = document.getElementById(key);
        const isChecked = elCheckUnavailable?.checked;
        // handle comment field
        const qid = key.split("-")[1];
        const addCommentButton = document.getElementById(`add-comment-${qid}`);
        const deleteCommentButton = document.getElementById(
          `delete-comment-${qid}`
        );
        const commentField = document.getElementById(`comment-${qid}`);
        if (isChecked) {
          // show comment field
          addCommentButton.style.display = "none";
          deleteCommentButton.style.display = "initial";
          commentField.style.display = "initial";
          commentField.value = text.inputDataUnavailable;
          setComment({
            [qid]: text.inputDataUnavailable,
          });
        } else {
          deleteCommentButton.style.display = "none";
          commentField.style.display = "none";
          addCommentButton.style.display = "initial";
          commentField.value = null;
          setComment({
            [qid]: null,
          });
        }
        // EOL handle comment field
        return { [qid]: isChecked ? text.inputDataUnavailable : null };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    // EOL handle data unavailable checkbox - comment

    // handle form values
    const filteredValues = Object.keys(values)
      .filter((key) => !key.includes("na"))
      .reduce((acc, curr) => ({ ...acc, [curr]: values[curr] }), {});
    const transformValues = Object.keys(filteredValues)
      .map((key) => {
        let question = key;
        let repeatIndex = 0;
        // manage repeat index
        if (key.includes("-")) {
          const split = key.split("-");
          question = split[0];
          repeatIndex = parseInt(split[1]);
        }
        // find comment
        const qid = parseInt(question);
        const findAnswer = answer.find((x) => x.question === qid);
        return {
          question: qid,
          value: values?.[key] ? values[key] : null,
          repeat_index: repeatIndex,
          comment: dataUnavailable?.[qid]
            ? dataUnavailable[qid]
            : findAnswer
            ? findAnswer?.comment
            : null,
        };
      })
      .filter((x) => x.value || x.value === 0 || dataUnavailable?.[x.question]); // isNan, allow comment with no value to submit
    setDisableSubmit(transformValues.length === 0);
    setAnswer(transformValues);
  };

  const onChangeComment = (qid, val) => {
    setComment({
      [qid]: val.target.value,
    });
  };

  const onDeleteComment = (qid) => {
    setDeletedComment(qid);
  };

  const onFinish = (/*values*/) => {
    if (answer.length) {
      const filteredAnswer = checkDependentValue(formValue, answer);
      const payload = reorderAnswersRepeatIndex(formValue, filteredAnswer);
      setIsSubmitting(true);
      const url = `/data/${savedData.id}/0?data_cleaning=1`;
      api
        .put(url, payload, {
          "content-type": "application/json",
        })
        .then(() => {
          setModalWarningVisible(false);
          setFormValue({});
          handleBack();
          notify({
            type: "success",
            message: "Submission updated successfully.",
          });
        })
        .catch((e) => {
          console.error(e);
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const onFinishShowWarning = () => {
    setIsForce(false);
    setModalWarningVisible(true);
  };

  const onCompleteFailed = () => {
    setIsForce(true);
    setModalWarningVisible(true);
  };
  const handleOnForceSubmit = () => {
    const filteredAnswer = checkDependentValue(formValue, answer);
    const payload = reorderAnswersRepeatIndex(formValue, filteredAnswer);
    setIsSubmitting(true);
    const url = `/data/${savedData.id}/0?data_cleaning=1`;
    api
      .put(url, payload, {
        "content-type": "application/json",
      })
      .then(() => {
        setModalWarningVisible(false);
        setFormValue({});
        handleBack();
        notify({
          type: "success",
          message: "Submission updated successfully.",
        });
        setFormValue({});
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <div id="webform">
        {!isEmpty(formValue) ? (
          <Webform
            forms={formValue}
            onChange={onChange}
            onFinish={onFinishShowWarning}
            onCompleteFailed={onCompleteFailed}
            submitButtonSetting={{
              loading: isSubmitting,
              disabled: disableSubmit,
            }}
            initialValue={initialAnswers}
          />
        ) : (
          <div className="loading-wrapper">
            <Spin />
          </div>
        )}
      </div>
      {/* Modal */}
      <Modal
        title=""
        open={modalWarningVisible}
        centered
        onCancel={() => setModalWarningVisible(false)}
        width="600px"
        destroyOnClose
        footer={
          <Row align="middle" justify="center">
            <Button
              type="primary"
              onClick={isForce ? handleOnForceSubmit : onFinish}
              loading={isSubmitting}
            >
              Update
            </Button>
            <Button onClick={() => setModalWarningVisible(false)}>
              Cancel
            </Button>
          </Row>
        }
        maskClosable={false}
      >
        <Row align="middle" justify="center">
          <Col span={24}>
            <Space
              align="center"
              direction="vertical"
              style={{ width: "100%" }}
            >
              <WarningOutlined
                style={{
                  fontSize: "50px",
                  color: "#F9CFA8",
                  marginBottom: "24px",
                }}
              />
              <h3>
                Are you sure want to update {datapoint?.datapoint_name || ""} ?
              </h3>
            </Space>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default DataCleaningWebform;
