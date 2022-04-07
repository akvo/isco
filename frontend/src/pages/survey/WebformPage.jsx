import React, { useState, useEffect } from "react";
import "./style.scss";
import { Spin } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty } from "lodash";
import ErrorPage from "../error/ErrorPage";
import { CommentField } from "../../components";

const WebformPage = ({ formId, setFormLoaded }) => {
  const user = store.useState((s) => s.user);
  const { member: userMember, isco: userIsco } = user.organisation;
  const allAccess = "All";

  const [formValue, setFormValue] = useState({});
  const [errorPage, setErrorPage] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [comment, setComment] = useState({});
  const [deletedComment, setDeletedComment] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (isEmpty(formValue) && formId && user) {
      api
        .get(`/webform/${formId}`)
        .then((res) => {
          const { data, status } = res;
          // submission already submitted
          if (status === 208) {
            setErrorPage(true);
          }
          if (status === 200) {
            // Filter survey detail by user login, using member/isco name
            let transformedQuestionGroup = data.question_group;
            if (userMember) {
              transformedQuestionGroup = transformedQuestionGroup.filter(
                (qg) =>
                  qg.member_access.includes(userMember) ||
                  qg.member_access.includes(allAccess)
              );
            }
            if (!isEmpty(userIsco)) {
              transformedQuestionGroup = transformedQuestionGroup.filter(
                (qg) =>
                  intersection(qg.isco_access, userIsco).length ||
                  qg.isco_access.includes(allAccess)
              );
            }
            // enable comment field
            transformedQuestionGroup = transformedQuestionGroup.map((qg) => {
              const updatedQuestion = qg.question.map((q) => {
                let extra = [
                  {
                    placement: "after",
                    content: (
                      <CommentField
                        onChange={(val) => onChangeComment(q.id, val)}
                        onDelete={() => onDeleteComment(q.id)}
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
              return {
                ...qg,
                question: updatedQuestion,
              };
            });
            setFormValue({ ...data, question_group: transformedQuestionGroup });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [formValue, formId, user, userMember, userIsco]);

  // set comment
  useEffect(() => {
    if (!isEmpty(comment) && answer.length) {
      const { qid, comment: commentValue } = comment;
      const findAnswer = answer.find((x) => x.question === qid);
      if (findAnswer) {
        // update answer
        const updatedAnswer = answer.map((a) => {
          let update = a;
          if (a.question === qid) {
            update = {
              ...update,
              comment: commentValue,
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

  const onChange = ({ /*current,*/ values /*, progress*/ }) => {
    // console.info(current, progress);
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
    setAnswer(transformValues);
  };

  const onChangeComment = (qid, val) => {
    setComment({
      qid: qid,
      comment: val.target.value,
    });
  };

  const onDeleteComment = (qid) => {
    setDeletedComment(qid);
  };

  const onFinish = (/*values*/) => {
    if (answer.length) {
      api
        .post(`/data/form/${formId}/1`, answer, {
          "content-type": "application/json",
        })
        .then(() => {
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
        });
    }
  };

  if (errorPage) {
    return <ErrorPage status="submission-exist" showButton={false} />;
  }

  return (
    <div id="webform">
      {!isEmpty(formValue) ? (
        <Webform forms={formValue} onChange={onChange} onFinish={onFinish} />
      ) : (
        <div className="loading-wrapper">
          <Spin />
        </div>
      )}
    </div>
  );
};

export default WebformPage;
