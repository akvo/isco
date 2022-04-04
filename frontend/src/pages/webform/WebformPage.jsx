import React, { useState, useEffect } from "react";
import "./style.scss";
import { useParams } from "react-router-dom";
import { Webform } from "akvo-react-form";
import { api } from "../../lib";
import { useNotification } from "../../util";

const WebformPage = () => {
  const { formId } = useParams();
  const [formValue, setFormValue] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    if (!formValue && formId) {
      api
        .get(`/webform/${formId}`)
        .then((res) => {
          setFormValue(res?.data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [formValue, formId]);

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
      {formValue && (
        <Webform forms={formValue} onChange={onChange} onFinish={onFinish} />
      )}
    </div>
  );
};

export default WebformPage;
