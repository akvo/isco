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
import { isNumeric } from "../../lib/util";

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
          repeat_index:
            !isNumeric(v.repeat_index) && v?.repeat_index_string
              ? v.repeat_index_string
              : vi,
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

const DataCleaningWebform = ({
  webformRef,
  datapoint,
  orgDetail,
  handleBack,
}) => {
  const { notify } = useNotification();

  const allAccess = "All";
  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const [formValue, setFormValue] = useState({});
  const [answer, setAnswer] = useState([]);

  const [comment, setComment] = useState({});
  const [commentDefValues, setCommentDefValues] = useState({});
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

  useEffect(() => {
    const webform = webformRef?.current;
    setDisableSubmit(true);
    setAnswer([]);
    setInitialAnswers([]);
    setComment({});
    webformRef?.current?.resetFields();
    return () => {
      // clear when unmount
      setDisableSubmit(true);
      setAnswer([]);
      setInitialAnswers([]);
      setComment({});
      if (webform) {
        webform?.resetFields();
      }
    };
  }, [webformRef]);

  // set comment def values
  useEffect(() => {
    if (!isEmpty(commentDefValues)) {
      setTimeout(() => {
        // get parent extra component node by name
        const extraElName = `arf-extra-content`;
        const els = document.getElementsByName(extraElName);
        // iterate over extra component dom
        els.forEach((el) => {
          // get arf qid from extra component parent
          const arfQid = el?.getAttribute("arf_qid");
          const isComment = commentDefValues?.[arfQid];
          // handle buttons
          const buttons = el?.getElementsByTagName("button");
          const delBtn = buttons?.[0];
          const addBtn = buttons?.[1];
          if (isComment && delBtn) {
            delBtn.style.display = "initial";
          }
          if (isComment && addBtn) {
            addBtn.style.display = "none";
          }
          // handle text area value
          const textArea = el.getElementsByTagName("textarea");
          if (isComment && textArea?.[0]) {
            textArea[0].style.display = "initial";
            textArea[0].value = commentDefValues?.[arfQid] || "";
          }
        });
      }, 500);
      setTimeout(() => {
        setCommentDefValues({});
      }, 1000);
    }
  }, [commentDefValues]);

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
              // handle leading question
              const questionWithLeadingQuestionGroup = form.question_group
                .flatMap((qg) => {
                  const question = qg.question.map((q) => ({
                    ...q,
                    lead_by_question: qg?.leading_question,
                  }));
                  return question;
                })
                ?.filter((q) => q?.lead_by_question);
              const answers = initial_values.answer.map((a) => {
                const { question, repeat_index, comment } = a;
                // handle leading question
                let repeatIndexString =
                  repeat_index > 0 ? String(repeat_index) : null;
                const findQuestion = questionWithLeadingQuestionGroup.find(
                  (q) => q.id === question
                );
                if (findQuestion?.lead_by_question) {
                  const leadingAnswer = initial_values.answer.find(
                    (a) => a.question === findQuestion.lead_by_question
                  )?.value;
                  repeatIndexString =
                    leadingAnswer?.[repeat_index] || repeat_index;
                }
                // eol handle leading question
                const commentQid =
                  repeat_index > 0 ? `${question}-${repeat_index}` : question;
                commentValues = {
                  ...commentValues,
                  [commentQid]: comment,
                };
                return {
                  ...a,
                  repeatIndex: isNumeric(repeat_index)
                    ? parseInt(repeat_index)
                    : repeat_index,
                  repeat_index: isNumeric(repeat_index)
                    ? parseInt(repeat_index)
                    : repeat_index,
                  repeat_index_string: repeatIndexString,
                };
              });
              setInitialAnswers(answers);
              setAnswer(answers);
              setCommentDefValues(commentValues);
            }
            // load initial value when user change translations
            if (!isEmpty(answer)) {
              setInitialAnswers(answer);
              answer.forEach((a) => {
                const { question, repeat_index, comment } = a;
                const commentQid =
                  repeat_index > 0 ? `${question}-${repeat_index}` : question;
                commentValues = {
                  ...commentValues,
                  [commentQid]: comment,
                };
              });
              setCommentDefValues(commentValues);
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
                        onAdd={onAddComment}
                        onChange={onChangeComment}
                        onDelete={onDeleteComment}
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
          const qid =
            a.repeat_index > 0 || a.repeat_index_string
              ? `${a.question}-${a.repeat_index_string}`
              : a.question;
          if (comment?.[qid] || comment[qid] === "") {
            return {
              ...a,
              comment: comment[qid] === "" ? null : comment[qid],
            };
          }
          return a;
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
          const qid =
            a.repeat_index > 0 || a.repeat_index_string
              ? `${a.question}-${a.repeat_index_string}`
              : a.question;
          if (String(deletedComment) === String(qid)) {
            return {
              ...a,
              comment: null,
            };
          }
          return a;
        });
        setAnswer(updatedAnswer);
        setDeletedComment(null);
      }
    }
  }, [deletedComment, answer]);

  const updatedAnswer = () => {
    // remap all answers with form getFieldsValue
    const finalFormValues = webformRef?.current?.getFieldsValue();
    let updatedAnswer = answer;
    if (finalFormValues) {
      updatedAnswer = Object.keys(finalFormValues)
        .map((key) => {
          const prevAnswer = answer.find((a) => {
            // return prev value with correct key
            const qid =
              a.repeat_index > 0 || a.repeat_index_string
                ? `${a.question}-${a.repeat_index_string}`
                : String(a.question);
            return qid === key;
          });
          if (prevAnswer) {
            return {
              ...prevAnswer,
              value: finalFormValues?.[key] || null,
            };
          }
          return false;
        })
        .filter((x) => x);
    }
    return updatedAnswer;
  };

  const onChange = ({ current, values /*progress*/ }) => {
    // handle data unavailable checkbox - comment
    const allKeyWithNA = Object.keys(values)
      .filter((key) => key.includes("dataNA_"))
      .map((key) => {
        const elCheckUnavailable = document.getElementById(key);
        const isChecked = elCheckUnavailable?.checked;
        const keySplit = key.split("_");
        const qidWithRepeatIndex = keySplit[1];
        return {
          [qidWithRepeatIndex]: isChecked ? text.inputDataUnavailable : null,
        };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const dataUnavailable = Object.keys(current)
      .filter((key) => key.includes("dataNA_"))
      .map((key) => {
        const elCheckUnavailable = document.getElementById(key);
        const isChecked = elCheckUnavailable?.checked;
        // handle comment field - also handle repeat index
        // find arf-extra-content
        const keySplit = key.split("_");
        const qidWithRepeatIndex = keySplit[1];
        const qid = String(qidWithRepeatIndex).split("-")[0];
        const extraContent = document.getElementById(
          `arf-extra-content-${qidWithRepeatIndex}`
        );
        const addCommentButton = extraContent.querySelector(
          `#add-comment-${qid}`
        );
        const deleteCommentButton = extraContent.querySelector(
          `#delete-comment-${qid}`
        );
        const commentField = extraContent.querySelector(`#comment-${qid}`);
        if (isChecked) {
          // show comment field
          if (addCommentButton) {
            addCommentButton.style.display = "none";
          }
          if (deleteCommentButton) {
            deleteCommentButton.style.display = "initial";
          }
          if (commentField) {
            commentField.style.display = "initial";
            commentField.value = text.inputDataUnavailable;
          }
          setComment({
            [qidWithRepeatIndex]: text.inputDataUnavailable,
          });
        } else {
          if (deleteCommentButton) {
            deleteCommentButton.style.display = "none";
          }
          if (addCommentButton) {
            addCommentButton.style.display = "initial";
          }
          if (commentField) {
            commentField.style.display = "none";
            commentField.value = null;
          }
          setComment({
            [qidWithRepeatIndex]: null,
          });
        }
        // EOL handle comment field
        return {
          [qidWithRepeatIndex]: isChecked ? text.inputDataUnavailable : null,
        };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const mergeDataUnavailable = {
      ...allKeyWithNA,
      ...dataUnavailable,
    };
    // EOL handle data unavailable checkbox - comment

    // handle form values
    const filteredValues = Object.keys(values)
      .filter((key) => !key.includes("dataNA_"))
      .reduce((acc, curr) => ({ ...acc, [curr]: values[curr] }), {});

    const transformValues = Object.keys(filteredValues)
      .map((key) => {
        let question = key;
        let repeatIndex = 0;
        let repeatIndexString = null;
        // manage repeat index
        if (key.includes("-")) {
          const split = key.split("-");
          question = split[0];
          repeatIndex = parseInt(split[1]);
          repeatIndexString = split[1];
        }
        // find comment
        const qid = parseInt(question);
        // find answer by qid and repeatIndex
        const findAnswer = answer.find(
          (x) =>
            x.question === qid &&
            (x.repeat_index === repeatIndex ||
              x.repeat_index_string === repeatIndexString)
        );
        // value
        const value = values?.[key] || values?.[key] === 0 ? values[key] : null;
        if (value || value === 0 || mergeDataUnavailable?.[key]) {
          return {
            question: qid,
            value: value,
            repeat_index: repeatIndex,
            repeat_index_string: repeatIndexString,
            comment: mergeDataUnavailable?.[key]
              ? mergeDataUnavailable[key] // using key because key is questionId-with repeat index
              : findAnswer
              ? findAnswer?.comment
              : null,
          };
        }
        return false;
      })
      .filter((x) => x); // isNan, allow comment with no value to submit
    setDisableSubmit(transformValues.length === 0);
    setAnswer(transformValues);
  };

  const onAddComment = (curr) => {
    const elParent = curr.currentTarget.parentNode.parentNode.parentNode;
    // handle buttons
    const buttons = elParent?.getElementsByTagName("button");
    const delBtn = buttons?.[0];
    const addBtn = buttons?.[1];
    if (delBtn) {
      delBtn.style.display = "initial";
    }
    if (addBtn) {
      addBtn.style.display = "none";
    }
    // handle text area
    const textArea = elParent.getElementsByTagName("textarea");
    if (textArea?.[0]) {
      textArea[0].style.display = "initial";
    }
  };

  const onChangeComment = (curr) => {
    const value = curr.target.value;
    const elParent = curr.currentTarget.parentNode.parentNode.parentNode;
    const arfQid = elParent.getAttribute("arf_qid");
    setComment({
      [arfQid]: value,
    });
  };

  const onDeleteComment = (curr) => {
    const elParent = curr.currentTarget.parentNode.parentNode.parentNode;
    const arfQid = elParent.getAttribute("arf_qid");
    // clear text area value
    const textArea = elParent.getElementsByTagName("textarea");
    textArea[0].value = "";
    // handle buttons
    const buttons = elParent?.getElementsByTagName("button");
    const delBtn = buttons?.[0];
    const addBtn = buttons?.[1];
    if (delBtn) {
      delBtn.style.display = "none";
    }
    if (addBtn) {
      addBtn.style.display = "initial";
    }
    if (textArea?.[0]) {
      textArea[0].style.display = "none";
    }
    setDeletedComment(arfQid);
  };

  const onFinish = (/*values*/) => {
    if (answer.length) {
      const filteredAnswer = checkDependentValue(formValue, updatedAnswer());
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
    const filteredAnswer = checkDependentValue(formValue, updatedAnswer());
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
            formRef={webformRef}
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
