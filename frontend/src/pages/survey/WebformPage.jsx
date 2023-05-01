import React, { useState, useEffect, useMemo, useCallback } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import "./style.scss";
import { Spin, Button, Checkbox } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty, orderBy, groupBy } from "lodash";
import ErrorPage from "../error/ErrorPage";
import {
  CommentField,
  SubmitWarningModal,
  ValidationWarningModal,
} from "../../components";
import { uiText } from "../../static";
// import test from "./test.json" // testing purpose

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
  webformRef,
  formId,
  setFormLoaded,
  selectedSavedSubmission,
  setReloadDropdownValue,
  selectedPrevSubmission,
  selectedFormEnablePrefilledValue,
  setCollaborators,
  selectedCollaborators,
  setSelectedCollaborators,
  setShowCollaboratorForm,
  resetSavedFormDropdown,
  clearForm,
  setClearForm,
}) => {
  // const formId = 7; testing purpose
  const { notify } = useNotification();

  const { user, language } = store.useState((s) => s);
  const { member: userMember, isco: userIsco } = user.organisation;
  const allAccess = "All";
  const { active: activeLang } = language;

  const [formValue, setFormValue] = useState({});
  const [errorPage, setErrorPage] = useState(false);
  const [answer, setAnswer] = useState([]);

  const [comment, setComment] = useState({});
  const [commentDefValues, setCommentDefValues] = useState({});
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
  const [checkCoreMandatoryQuestion, setCheckCoreMandatoryQuestion] =
    useState(false);
  // computed validation popup
  const [validationWarningModalVisible, setValidationWarningModalVisible] =
    useState(false);
  // to save computed validation error detail (array of object)
  const [checkComputedValidation, setCheckComputedValidation] = useState([]);
  // prefilled value
  const [mismatch, setMismatch] = useState(false);
  // check if from prev year value
  const isSavedDataFromPrevSubmission =
    savedData?.id &&
    selectedPrevSubmission &&
    selectedPrevSubmission !== "" &&
    savedData.id === selectedPrevSubmission;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const resetForm = () => {
    if (
      clearForm &&
      (selectedPrevSubmission === "" || !selectedPrevSubmission)
    ) {
      setDisableSubmit(true);
      setAnswer([]);
      setInitialAnswers([]);
      setComment({});
      setClearForm(false);
      webformRef?.current?.resetFields();
    }
  };

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

  // core mandatory questions
  const coreMandatoryQuestionIds = useMemo(() => {
    if (!formValue?.question_group) {
      return [];
    }
    return formValue.question_group
      .map((qg) => {
        const qIds = qg.question
          .filter((q) => q?.core_mandatory || q?.coreMandatory)
          .map((q) => q.id);
        if (!qIds?.length) {
          return false;
        }
        return {
          group_id: qg.id,
          question_ids: qIds,
        };
      })
      .filter((x) => x);
  }, [formValue]);

  const groupRepeatableAnswerValues = useCallback(
    (answerValues) => {
      const allQuestions = formValue.question_group.flatMap((qg) =>
        qg.question.map((q) => ({
          id: q.id,
          group: qg.id,
          name: q.name,
        }))
      );
      /*
       * const answerValues
       * choose which answer values to be used as validation check
       * manage this for cascade/geo value not directly saved to answer state onChange form value
       * group by repeat_index to support repeatable question
       */
      const res = answerValues.map((av) => {
        /*
         * Fix repeatable group index using group id,
         * groupId_repeatableIndex
         * prevent wrong grouping
         */
        const findGroup =
          allQuestions.find((q) => q.id === av.question)?.group || "";
        const repeatIndex = String(av.repeat_index);
        return {
          ...av,
          group: `${findGroup}_${repeatIndex}`,
        };
      });
      return groupBy(res, "group");
    },
    [formValue.question_group]
  );

  // check computed validations
  const checkComputedValidationFunction = useCallback(
    (onChangeEvent = true, values = []) => {
      // Need to remap question_ids from computed validation config to form def
      // because questions availability related to member/isco type
      let answerValues = values?.length ? values : answer;
      answerValues = groupRepeatableAnswerValues(answerValues);
      const validations =
        computedValidations
          .find((cv) => cv.form_id === formId)
          ?.validations?.map((v) => {
            // also remap the question group if not available for member/isco type
            const findGroup = formValue?.question_group?.find(
              (qg) => qg.id === v.group_id
            );
            if (!findGroup) {
              return false;
            }
            // remap questions
            const availableQids = findGroup?.question?.map((q) => q.id);
            const remapQuestion = intersection(v.question_ids, availableQids);
            if (!remapQuestion?.length) {
              return false;
            }
            return {
              ...v,
              question_ids: remapQuestion,
            };
          })
          ?.filter((x) => x) || [];
      // if (!Object.keys(answerValues).length && !validations?.length) {
      //   return [];
      // }
      const checkError = Object.keys(answerValues)
        .map((k) => {
          const resValues = answerValues[k];
          const repeatIndex = resValues?.[0]?.repeat_index;
          return validations
            .map((v) => {
              /*
               *CHECK for repeateable group
               * if repetable group contains validation group id do computed validation check
               * else ignore it
               */
              if (!k.includes(String(v.group_id))) {
                return {
                  ...v,
                  error: false,
                };
              }
              /** EOL CHECK repeatable group */

              // check if all computed validation answered
              const checkAllAnswered = intersection(
                v.question_ids,
                resValues.map((a) => a.question)
              );

              // only do this when use on change event TRUE
              if (
                onChangeEvent &&
                checkAllAnswered.length !== v.question_ids.length
              ) {
                // not all answered
                return {
                  ...v,
                  error: false,
                };
              }

              // all answered
              const questions = v.question_ids.map((id) => {
                const a = resValues.find((a) => a.question === id);
                return { id: id, answer: a?.value };
              });
              const filterNumber = questions
                .map((q) => q.answer)
                .filter((q) => !isNaN(q));
              // round total value
              const total =
                filterNumber.reduce((total, num) => total + num * 100, 0) / 100;
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
              if ("equal" in v) {
                errorDetail = text.cvEqualValueText;
                error = total !== v.equal;
                validationValue = v.equal;
              }
              return {
                ...v,
                questions: questions,
                error: error,
                total: total,
                errorDetail: errorDetail,
                validationValue: validationValue,
                repeatIndex: repeatIndex + 1,
              };
            })
            .filter((v) => v.error);
        })
        .flat();
      if (onChangeEvent) {
        setTimeout(() => {
          setValidationWarningModalVisible(checkError.length);
        }, 1000);
        setCheckComputedValidation(checkError);
        return;
      }
      return checkError;
    },
    [
      answer,
      formId,
      text.cvMaxValueText,
      text.cvMinValueText,
      text.cvEqualValueText,
      formValue?.question_group,
      groupRepeatableAnswerValues,
    ]
  );

  // check computed validation when on change answer
  // useEffect(() => {
  //   checkComputedValidationFunction();
  // }, [checkComputedValidationFunction]);

  // transform & filter form definition for first load
  useEffect(() => {
    if (formId && userMember && userIsco) {
      const savedDataId = selectedSavedSubmission?.id;
      let url = `/webform/${formId}`;
      // handle load prefilled questionnaire with prev year value
      const isLoadPrevSubmissionVal =
        selectedPrevSubmission &&
        selectedPrevSubmission !== "" &&
        selectedFormEnablePrefilledValue &&
        !savedDataId;
      if (isLoadPrevSubmissionVal) {
        url = `/webform/previous-submission/${formId}?data_id=${selectedPrevSubmission}`;
      }
      // handle saved data
      if (savedDataId) {
        url = `${url}?data_id=${savedDataId}`;
      }
      api
        .get(url)
        .then((res) => {
          const { data, status } = res;
          // const { form, initial_values, mismatch, collaborators } = test; // testing purpose
          const { form, initial_values, mismatch, collaborators } = data;
          // submission already submitted
          if (status === 208) {
            setErrorPage(true);
          }
          if (status === 200) {
            let commentValues = {};
            // load initial form value from saved data
            if (initial_values && isEmpty(answer)) {
              setIsLocked(initial_values.locked_by);
              setSavedData(initial_values);
              const answers = initial_values.answer.map((a) => {
                const { question, repeat_index, comment } = a;
                const commentQid =
                  repeat_index > 0 ? `${question}-${repeat_index}` : question;
                commentValues = {
                  ...commentValues,
                  [commentQid]: comment,
                };
                return {
                  ...a,
                  repeatIndex: repeat_index,
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
                        onChange={onChangeComment}
                        onDelete={onDeleteComment}
                      />
                    ),
                  },
                ];
                // datapoint / display name
                if (typeof q?.datapoint_name !== "undefined") {
                  q = {
                    ...q,
                    meta: q.datapoint_name,
                  };
                }
                // core mandatory
                if (typeof q?.core_mandatory !== "undefined") {
                  q = {
                    ...q,
                    coreMandatory: q.core_mandatory,
                  };
                  delete q.core_mandatory;
                }
                // requiredSign
                if (q?.coreMandatory) {
                  q = {
                    ...q,
                    requiredSign: "**",
                  };
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
            // test

            // show prefilled value mismatch (pre-filled value)
            if (isLoadPrevSubmissionVal) {
              setCollaborators(collaborators || []);
              setSelectedCollaborators(
                collaborators?.length
                  ? collaborators.map((x) => x.organisation)
                  : []
              );
              setShowCollaboratorForm(collaborators?.length || false);
              setTimeout(() => {
                setMismatch(mismatch || false);
                setModalWarningVisible(mismatch || false);
              }, 500);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSavedSubmission,
    activeLang,
    userMember,
    userIsco,
    formId,
    // answer,
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
      // update answer
      const updatedAnswer = answer.map((a) => {
        const qid =
          a.repeat_index > 0 ? `${a.question}-${a.repeat_index}` : a.question;
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
  }, [comment, answer]);

  // delete comment
  useEffect(() => {
    if (deletedComment && answer.length) {
      // update answer
      const updatedAnswer = answer.map((a) => {
        const qid =
          a.repeat_index > 0 ? `${a.question}-${a.repeat_index}` : a.question;
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
  }, [deletedComment, answer]);

  const onSubmitValidationOrShowSubmitWarning = (values = []) => {
    /*
     * const answerValues
     * choose which answer values to be used as validation check
     * manage this for cascade/geo value not directly saved to answer state onChange form value
     */
    let answerValues = values?.length ? values : answer;
    // check computed validation
    const checkComputedValidaitonOnSubmit = checkComputedValidationFunction(
      false,
      values
    );
    // begin check core mandatory answered
    let checkCoreMandatoryQuestionFailed = false;
    if (coreMandatoryQuestionIds.length) {
      // check if core mandatory answered
      const allAnswers = answerValues;
      answerValues = groupRepeatableAnswerValues(answerValues);
      const checkError = Object.keys(answerValues)
        .map((k) => {
          const resValues = answerValues[k];
          return coreMandatoryQuestionIds.map((v) => {
            if (!k.includes(String(v.group_id))) {
              return false;
            }
            const answerQids = resValues.map((a) => a.question);
            const coreMandatoryAnswers = intersection(
              v.question_ids,
              answerQids
            );
            return v.question_ids.length !== coreMandatoryAnswers.length;
          });
        })
        .flat()
        .filter((x) => x);
      // overall
      const allMandatoryQids = coreMandatoryQuestionIds.flatMap(
        (q) => q.question_ids
      );
      const allAnswerQids = allAnswers.map((a) => a.question);
      const allCoreMandatoryAnswers = intersection(
        allMandatoryQids,
        allAnswerQids
      );
      // true if not all mandatory questions answered
      checkCoreMandatoryQuestionFailed =
        checkError.length > 0 ||
        allMandatoryQids.length !== allCoreMandatoryAnswers.length;
    }
    if (
      checkComputedValidaitonOnSubmit?.length ||
      checkCoreMandatoryQuestionFailed
    ) {
      // show computed/core mandatory validation warning
      setCheckComputedValidation(checkComputedValidaitonOnSubmit);
      setValidationWarningModalVisible(true);
      setCheckCoreMandatoryQuestion(checkCoreMandatoryQuestionFailed);
      return;
    }
    // show warning before submit
    setModalWarningVisible(true);
    onCloseValidationWarningModal();
  };

  const onCloseValidationWarningModal = () => {
    setValidationWarningModalVisible(false);
    setCheckCoreMandatoryQuestion(false);
    setCheckComputedValidation([]);
  };

  const transformValues = (values) => {
    return Object.keys(values)
      .filter((key) => {
        // filter key !== datapoint object
        return key.toLowerCase() !== "datapoint";
      })
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
        // find answer by qid and repeatIndex
        const findAnswer = answer.find(
          (x) => x.question === qid && x.repeat_index === repeatIndex
        );
        return {
          question: qid,
          value: values[key],
          repeat_index: repeatIndex,
          comment: findAnswer ? findAnswer?.comment : null,
        };
      })
      .filter((x) => x.value || x.value === 0); // isNan
  };

  const onChange = ({ values }) => {
    const transformedAnswerValues = transformValues(values);
    setDisableSubmit(transformValues.length === 0);
    setAnswer(transformedAnswerValues);
    // reset form for prev submisison value to empty
    setTimeout(() => {
      resetForm();
    }, 100);
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
    setDeletedComment(arfQid);
  };

  const generateEndpoint = ({ payload, submitted }) => {
    let url =
      !savedData?.id || isSavedDataFromPrevSubmission
        ? `/data/form/${formId}/${submitted}`
        : `/data/${savedData.id}/${submitted}`;
    if (isLocked) {
      url = `${url}?locked_by=${user.id}`;
    }
    // send collaborators value when submit/save for first time
    if (
      selectedPrevSubmission &&
      selectedPrevSubmission !== "" &&
      selectedFormEnablePrefilledValue &&
      selectedCollaborators?.length
    ) {
      const queryParams = selectedCollaborators.join("&collaborators=");
      url = isLocked ? `${url}&` : `${url}?`;
      url = `${url}collaborators=${queryParams}`;
    }
    // check if from prev year value
    const endpoint =
      !savedData?.id || isSavedDataFromPrevSubmission
        ? api.post(url, payload, {
            "content-type": "application/json",
          })
        : api.put(url, payload, {
            "content-type": "application/json",
          });
    return endpoint;
  };

  const onFinish = () => {
    if (answer.length) {
      const payload = reorderAnswersRepeatIndex(formValue, answer);
      setIsSubmitting(true);
      const endpoint = generateEndpoint({ payload: payload, submitted: 1 });
      endpoint
        .then((res) => {
          // hide collaborator form & reset collaborator value
          resetSavedFormDropdown();
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
      const endpoint = generateEndpoint({ payload: payload, submitted: 0 });
      endpoint
        .then((res) => {
          // if POST endpoint (no save data id or isSavedDataFromPrevSubmission)
          if (!savedData?.id || isSavedDataFromPrevSubmission) {
            // hide collaborator form & reset collaborator value
            resetSavedFormDropdown();
          }
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

  const onFinishShowWarning = (values) => {
    setIsSubmitting(true);
    const transformedAnswerValues = transformValues(values);
    setAnswer(transformedAnswerValues);
    setIsForce(false);
    setIsSave(false);
    setTimeout(() => {
      onSubmitValidationOrShowSubmitWarning(transformedAnswerValues);
      setIsSubmitting(false);
    }, 1000);
  };

  const onCompleteFailed = ({ values }) => {
    setIsSubmitting(true);
    const transformedAnswerValues = transformValues(values);
    setAnswer(transformedAnswerValues);
    // force submit
    setIsSave(false);
    setIsForce(true);
    setTimeout(() => {
      onSubmitValidationOrShowSubmitWarning(transformedAnswerValues);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleOnForceSubmit = () => {
    const payload = reorderAnswersRepeatIndex(formValue, answer);
    setIsSubmitting(true);
    const endpoint = generateEndpoint({ payload: payload, submitted: 1 });
    endpoint
      .then((res) => {
        // hide collaborator form & reset collaborator value
        resetSavedFormDropdown();
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
            formRef={webformRef}
            forms={formValue}
            fieldIcons={false}
            onChange={onChange}
            onFinish={onFinishShowWarning}
            onCompleteFailed={onCompleteFailed}
            extraButton={
              <>
                {/* Save Button cannot do the same thing to check
                    cascade / geo input value onClick save button,
                    we only can get the value from answer state from form onChange event
                  */}
                <SaveButton
                  onClick={() => {
                    setIsForce(false);
                    setIsSave(true);
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
              // don't disabled when survey has core mandatory questions
              disabled: disableSubmit && !coreMandatoryQuestionIds?.length,
            }}
            initialValue={initialAnswers}
          />
        ) : (
          <div className="loading-wrapper">
            <Spin />
          </div>
        )}
      </div>
      {/* Modal
       * TODO: Need to refactor this submit warning modal to send more proper kind of warning
       * then we can catch that kind of warning inside a switch case
       */}
      <SubmitWarningModal
        visible={modalWarningVisible}
        onOk={
          isForce
            ? handleOnForceSubmit
            : isSave
            ? handleOnClickSaveButton
            : onFinish
        }
        onCancel={() => {
          setModalWarningVisible(false);
          setMismatch(false);
        }}
        btnLoading={isSubmitting || isSaving}
        force={isForce}
        save={isSave}
        mismatch={mismatch}
      />
      {/* Core Mandatory / Computed Validation Warning */}
      <ValidationWarningModal
        visible={validationWarningModalVisible}
        onCancel={onCloseValidationWarningModal}
        checkComputedValidation={checkComputedValidation}
        formValue={formValue}
        checkCoreMandatoryQuestion={checkCoreMandatoryQuestion}
      />
    </>
  );
};

export default WebformPage;
