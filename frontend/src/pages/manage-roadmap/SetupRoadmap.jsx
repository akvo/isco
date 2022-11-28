import React, { useState, useEffect } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Spin } from "antd";
import { Webform } from "akvo-react-form";
import { api } from "../../lib";
import isEmpty from "lodash/isEmpty";

const SetupRoadmap = () => {
  const [formValue, setFormValue] = useState({});

  useEffect(() => {
    api
      .get("/roadmap-webform")
      .then((res) => {
        const webform = res.data;
        delete res.data?.initial_value;
        setFormValue(webform);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <div id="setup-roadmap">
      {isEmpty(formValue) ? (
        <div className="loading-wrapper">
          <Spin />
        </div>
      ) : (
        <Webform forms={formValue} />
      )}
    </div>
  );
};

export default SetupRoadmap;
