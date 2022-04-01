import React, { useState, useEffect } from "react";
import "./style.scss";
import { useParams } from "react-router-dom";
import { Webform } from "akvo-react-form";
import { api } from "../../lib";

const WebformPage = () => {
  const { formId } = useParams();
  const [formValue, setFormValue] = useState(false);

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
    console.info(values);
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
