import React, { useState, useEffect } from "react";
import "./style.scss";
import { useParams } from "react-router-dom";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { intersection, isEmpty } from "lodash";

const WebformPage = () => {
  const user = store.useState((s) => s.user);
  const { member: userMember, isco: userIsco } = user.organisation;
  const allAccess = "All";

  const { formId } = useParams();
  const [formValue, setFormValue] = useState({});
  const { notify } = useNotification();

  useEffect(() => {
    if (isEmpty(formValue) && formId && user) {
      api
        .get(`/webform/${formId}`)
        .then((res) => {
          const { data } = res;
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
                intersection(qg.isco_access, userIsco) ||
                qg.isco_access.includes(allAccess)
            );
          }
          setFormValue({ ...data, question_group: transformedQuestionGroup });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [formValue, formId, user, userMember, userIsco]);

  const onChange = ({ current, values, progress }) => {
    console.info(current, values, progress);
  };

  const onFinish = (values) => {
    const transformValues = Object.keys(values).map((key) => {
      return {
        question: key,
        value: values[key],
        repeat_index: 0,
      };
    });
    api
      .post(`/data/form/${formId}/1`, transformValues, {
        "content-type": "application/json",
      })
      .then(() => {
        notify({
          type: "success",
          message: "Subission submitted successfully.",
        });
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Oops, something when wrong.",
        });
      });
  };

  return (
    <div id="webform" className="container">
      {!isEmpty(formValue) && (
        <Webform forms={formValue} onChange={onChange} onFinish={onFinish} />
      )}
    </div>
  );
};

export default WebformPage;
