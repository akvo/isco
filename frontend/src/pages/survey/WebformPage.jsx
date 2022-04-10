import React, { useState, useEffect } from "react";
import "./style.scss";
import { Spin, Button, Checkbox } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty } from "lodash";
import ErrorPage from "../error/ErrorPage";
import { CommentField } from "../../components";

const SaveButton = ({ onClick, isSaving }) => (
  <Button loading={isSaving} onClick={onClick}>
    Save
  </Button>
);

const LockedCheckbox = ({ onChange, isLocked }) => (
  <>
    <Checkbox checked={isLocked} onChange={onChange} /> Locked
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
      return repeatValues
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

  const user = store.useState((s) => s.user);
  const { member: userMember, isco: userIsco } = user.organisation;
  const allAccess = "All";

  const [formValue, setFormValue] = useState({});
  const [errorPage, setErrorPage] = useState(false);
  const [answer, setAnswer] = useState([]);

  const [comment, setComment] = useState({});
  const [deletedComment, setDeletedComment] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  // save savedData here, for loaded form this must be saved when loading form value
  const [savedData, setSavedData] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState([]);

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
              if (userMember) {
                updatedQuestions = updatedQuestions.filter(
                  (q) =>
                    q.member_access.includes(userMember) ||
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
            setFormValue({ ...form, question_group: transformedQuestionGroup });
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
  ]);

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
            message: "Subission submitted successfully.",
          });
          setFormLoaded(null);
          setFormValue({});
        })
        .catch((e) => {
          console.error(e);
          notify({
            type: "error",
            message: "Oops, something when wrong.",
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
            message: "Subission saved successfully.",
          });
        })
        .catch((e) => {
          console.error(e);
          notify({
            type: "error",
            message: "Oops, something when wrong.",
          });
        })
        .finally(() => {
          setIsSaving(false);
          setReloadDropdownValue(true);
        });
    }
  };

  if (errorPage) {
    return <ErrorPage status="submission-exist" showButton={false} />;
  }

  return (
    <div id="webform">
      {!isEmpty(formValue) ? (
        <Webform
          forms={formValue}
          onChange={onChange}
          onFinish={onFinish}
          extraButton={
            <>
              <SaveButton
                onClick={handleOnClickSaveButton}
                isSaving={isSaving}
              />
              <LockedCheckbox
                onChange={(val) => setIsLocked(val.target.checked)}
                isLocked={isLocked}
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
  );
};

export default WebformPage;
