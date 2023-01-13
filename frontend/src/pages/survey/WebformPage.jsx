import React, { useState, useEffect, useMemo } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import "./style.scss";
import { Spin, Button, Checkbox } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty, orderBy } from "lodash";
import ErrorPage from "../error/ErrorPage";
import {
  CommentField,
  SubmitWarningModal,
  ComputedValidationModal,
} from "../../components";
import { uiText } from "../../static";

const computedValidations = window?.computed_validations;

const SaveButton = ({ onClick, isSaving, text, disabled = false }) => (
  <Button loading={isSaving} onClick={onClick} disabled={disabled}>
    {text.btnSave}
  </Button>
);

const LockedCheckbox = ({ onChange, isLocked, text }) => (
  <>
    <Checkbox checked={isLocked} onChange={onChange} /> {text.lockedBy}
  </>
);

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

const WebformPage = ({
  formId,
  setFormLoaded,
  selectedSavedSubmission,
  setReloadDropdownValue,
}) => {
  const { notify } = useNotification();

  const { user, language } = store.useState((s) => s);
  const { member: userMember, isco: userIsco } = user.organisation;
  const allAccess = "All";
  const { active: activeLang } = language;

  const [formValue, setFormValue] = useState({});
  const [errorPage, setErrorPage] = useState(false);
  const [answer, setAnswer] = useState([]);

  const [comment, setComment] = useState({});
  const [deletedComment, setDeletedComment] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const [isForce, setIsForce] = useState(false);
  const [isSave, setIsSave] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  // save savedData here, for loaded form this must be saved when loading form value
  const [savedData, setSavedData] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState([]);
  // warning modal
  const [modalWarningVisible, setModalWarningVisible] = useState(false);
  // core mandatory popup
  const [showCoreMandatoryWarning, setShowCoreMandatoryWarning] =
    useState(false);
  // computed validation popup
  const [computedValidationModalVisible, setComputedValidationModalVisible] =
    useState(false);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  // core mandatory questions
  const coreMandatoryQuestionIds = useMemo(() => {
    if (!formValue?.question_group) {
      return [];
    }
    return formValue.question_group.flatMap((qg) =>
      qg.question
        .filter((q) => q?.core_mandatory || q?.coreMandatory)
        .map((q) => q.id)
    );
  }, [formValue]);

  // check computed validations
  const checkComputedValidation = useMemo(() => {
    if (!answer.length) {
      return [];
    }
    const { validations } = computedValidations.find(
      (cv) => cv.form_id === formId
    );
    const checkError = validations
      .map((v) => {
        const questions = v.question_ids.map((id) => {
          const a = answer.find((a) => a.question === id);
          return { id: id, answer: a?.value || 0 };
        });
        const total = questions
          .map((q) => q.answer)
          .reduce((total, num) => total + num);
        let error = false;
        let errorDetail = "";
        let validationValue = 0;
        if ("max" in v) {
          errorDetail = text.cvMaxValueText;
          error = total > v.max;
          validationValue = v.max;
        }
        if ("min" in v) {
          errorDetail = text.cvMinValueText;
          error = total < v.min;
          validationValue = v.min;
        }
        return {
          ...v,
          questions: questions,
          error: error,
          total: total,
          errorDetail: errorDetail,
          validationValue: validationValue,
        };
      })
      .filter((v) => v.error);
    setTimeout(() => {
      setComputedValidationModalVisible(checkError.length);
    }, 1000);
    return checkError;
  }, [answer, formId, text.cvMaxValueText, text.cvMinValueText]);

  // transform & filter form definition
  useEffect(() => {
    if (isEmpty(formValue) && formId && user) {
      const savedDataId = selectedSavedSubmission?.id;
      let url = `/webform/${formId}`;
      if (savedDataId) {
        url = `${url}?data_id=${savedDataId}`;
      }
      api
        .get(url)
        .then((res) => {
          const { data, status } = res;
          const { form, initial_values } = data;
          // submission already submitted
          if (status === 208) {
            setErrorPage(true);
          }
          if (status === 200) {
            let commentValues = {};
            // load initial form value from saved data
            if (initial_values && !savedData) {
              setIsLocked(initial_values.locked_by);
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
                //core mandatory
                if (typeof q?.core_mandatory !== "undefined") {
                  q = {
                    ...q,
                    coreMandatory: q.core_mandatory,
                  };
                  delete q.core_mandatory;
                }
                // allow decimal
                if (q?.rule && q?.rule?.allowDecimal) {
                  q.rule = {
                    ...q.rule,
                    allowDecimal: true,
                  };
                }
                if (q?.extra) {
                  extra = [...extra, q.extra];
                }
                return {
                  ...q,
                  extra: extra,
                };
              });
              // Filter survey detail by user login, using member/isco name
              if (userMember) {
                updatedQuestions = updatedQuestions.filter(
                  (q) =>
                    intersection(q.member_access, userMember).length ||
                    q.member_access.includes(allAccess)
                );
              }
              if (!isEmpty(userIsco)) {
                updatedQuestions = updatedQuestions.filter(
                  (q) =>
                    intersection(q.isco_access, userIsco).length ||
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
    user,
    userMember,
    userIsco,
    selectedSavedSubmission,
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
      .filter((x) => x.value || x.value === 0);
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
      let url = !savedData?.id
        ? `/data/form/${formId}/1`
        : `/data/${savedData.id}/1`;
      if (isLocked) {
        url = `${url}?locked_by=${user.id}`;
      }
      const endpoint = !savedData?.id
        ? api.post(url, payload, {
            "content-type": "application/json",
          })
        : api.put(url, payload, {
            "content-type": "application/json",
          });
      endpoint
        .then((res) => {
          if (res.status === 208) {
            setErrorPage(true);
            return;
          }
          notify({
            type: "success",
            message: "Submission submitted successfully.",
          });
          setFormLoaded(null);
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
          setReloadDropdownValue(true);
        });
    }
  };

  const handleOnClickSaveButton = () => {
    if (answer.length) {
      const payload = reorderAnswersRepeatIndex(formValue, answer);
      setIsSaving(true);
      let url = !savedData?.id
        ? `/data/form/${formId}/0`
        : `/data/${savedData.id}/0`;
      if (isLocked) {
        url = `${url}?locked_by=${user.id}`;
      }
      const endpoint = !savedData?.id
        ? api.post(url, payload, {
            "content-type": "application/json",
          })
        : api.put(url, payload, {
            "content-type": "application/json",
          });
      endpoint
        .then((res) => {
          // submission already submitted
          if (res.status === 208) {
            setErrorPage(true);
            return;
          }
          setSavedData(res.data);
          notify({
            type: "success",
            message: "Submission saved successfully.",
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
          setModalWarningVisible(false);
          setIsSaving(false);
          setReloadDropdownValue(true);
        });
    }
  };

  const onFinishShowWarning = () => {
    setIsForce(false);
    setIsSave(false);
    setShowCoreMandatoryWarning(false);
    setModalWarningVisible(true);
  };

  const onCompleteFailed = () => {
    // check if core mandatory answered
    const answerQids = answer.map((a) => a.question);
    const coreMandatoryAnswers = intersection(
      coreMandatoryQuestionIds,
      answerQids
    );
    if (coreMandatoryQuestionIds.length !== coreMandatoryAnswers.length) {
      // not all of core mandatory answered
      // show core mandatory popup
      setIsSave(false);
      setIsForce(false);
      setShowCoreMandatoryWarning(true);
      setModalWarningVisible(true);
      return;
    }
    setIsSave(false);
    setIsForce(true);
    setShowCoreMandatoryWarning(false);
    setModalWarningVisible(true);
  };

  const handleOnForceSubmit = () => {
    const payload = reorderAnswersRepeatIndex(formValue, answer);
    setIsSubmitting(true);
    let url = !savedData?.id
      ? `/data/form/${formId}/1`
      : `/data/${savedData.id}/1`;
    if (isLocked) {
      url = `${url}?locked_by=${user.id}`;
    }
    const endpoint = !savedData?.id
      ? api.post(url, payload, {
          "content-type": "application/json",
        })
      : api.put(url, payload, {
          "content-type": "application/json",
        });
    endpoint
      .then((res) => {
        if (res.status === 208) {
          setErrorPage(true);
          return;
        }
        notify({
          type: "success",
          message: "Submission submitted successfully.",
        });
        setFormLoaded(null);
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
        setReloadDropdownValue(true);
      });
  };

  if (errorPage) {
    return <ErrorPage status="submission-exist" showButton={false} />;
  }

  return (
    <>
      <div id="webform">
        {!isEmpty(formValue) ? (
          <Webform
            forms={formValue}
            onChange={onChange}
            onFinish={onFinishShowWarning}
            onCompleteFailed={onCompleteFailed}
            extraButton={
              <>
                <SaveButton
                  onClick={() => {
                    setIsForce(false);
                    setIsSave(true);
                    setShowCoreMandatoryWarning(false);
                    setModalWarningVisible(true);
                  }}
                  isSaving={isSaving}
                  text={text}
                  disabled={!answer.length}
                />
                <LockedCheckbox
                  onChange={(val) => setIsLocked(val.target.checked)}
                  isLocked={isLocked}
                  text={text}
                />
              </>
            }
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
        onOk={
          isForce
            ? handleOnForceSubmit
            : isSave
            ? handleOnClickSaveButton
            : onFinish
        }
        onCancel={() => setModalWarningVisible(false)}
        btnLoading={isSubmitting || isSaving}
        force={isForce}
        save={isSave}
        showCoreMandatoryWarning={showCoreMandatoryWarning}
      />
      {/* Computed Validation Warning */}
      <ComputedValidationModal
        visible={computedValidationModalVisible}
        onCancel={() => setComputedValidationModalVisible(false)}
        checkComputedValidation={checkComputedValidation}
        formValue={formValue}
      />
    </>
  );
};

export default WebformPage;
