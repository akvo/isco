import React, { useState, useEffect } from "react";
import "./style.scss";
import { Spin } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty, orderBy } from "lodash";
import { CommentField, SubmitWarningModal } from "../../components";

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

const DataCleaningWebform = ({ datapoint, orgDetail }) => {
  const { notify } = useNotification();

  const formId = datapoint.form;
  const { language } = store.useState((s) => s);
  const { member: orgMember, isco: orgIsco } = orgDetail;
  const allAccess = "All";
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

  // transform & filter form definition
  useEffect(() => {
    if (isEmpty(formValue) && formId && orgDetail) {
      const url = `/webform/${formId}?data_id=${datapoint.id}&data_cleaning=1`;
      api
        .get(url)
        .then((res) => {
          const { data, status } = res;
          const { form, initial_values } = data;
          if (status === 200) {
            let commentValues = {};
            // load initial form value from saved data
            if (initial_values && !savedData) {
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
                        onChange={(val) => onChangeComment(q.id, val)}
                        onDelete={() => onDeleteComment(q.id)}
                        defaultValue={
                          commentValues?.[q.id] ? commentValues?.[q.id] : null
                        }
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
  }, [
    formValue,
    formId,
    orgDetail,
    orgMember,
    orgIsco,
    datapoint,
    savedData,
    activeLang,
    answer,
  ]);

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
    const transformValues = Object.keys(values)
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
          value: values[key],
          repeat_index: repeatIndex,
          comment: findAnswer ? findAnswer?.comment : null,
        };
      })
      .filter((x) => x.value);
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
      const payload = reorderAnswersRepeatIndex(formValue, answer);
      setIsSubmitting(true);
      const url = `/data/${savedData.id}/0?data_cleaning=1`;
      api
        .put(url, payload, {
          "content-type": "application/json",
        })
        .then((res) => {
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
          setModalWarningVisible(false);
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
    const payload = reorderAnswersRepeatIndex(formValue, answer);
    setIsSubmitting(true);
    const url = `/data/${savedData.id}/0?data_cleaning=1`;
    api
      .put(url, payload, {
        "content-type": "application/json",
      })
      .then((res) => {
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
        setModalWarningVisible(false);
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
      <SubmitWarningModal
        visible={modalWarningVisible}
        onOk={isForce ? handleOnForceSubmit : onFinish}
        onCancel={() => setModalWarningVisible(false)}
        force={isForce}
      />
    </>
  );
};

export default DataCleaningWebform;
