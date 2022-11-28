import React, { useState, useEffect, useMemo } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Row, Col, Select, Spin, Space } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import isEmpty from "lodash/isEmpty";
import { useNotification } from "../../util";

const SetupRoadmap = ({ setCurrentTab }) => {
  const { notify } = useNotification();
  const [formValue, setFormValue] = useState({});
  const [selectedOrg, setSelectedOrg] = useState(null);
  const organisations = store.useState((s) => s.optionValues.organisation);

  const organisationOptions = useMemo(() => {
    return organisations.map((org) => ({
      label: org.name,
      value: org.id,
    }));
  }, [organisations]);

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

  const onFinish = (values) => {
    const findOrg = organisations.find((o) => o.id === selectedOrg);
    if (values?.datapoint) {
      delete values.datapoint;
    }
    const payload = {
      organisation_id: selectedOrg,
      answers: values,
    };
    api
      .post(`/roadmap-webform`, payload, {
        "content-type": "application/json",
      })
      .then(() => {
        notify({
          type: "success",
          message: `Roadmap for ${findOrg.name} submitted.`,
        });
        setCurrentTab("current-roadmap");
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      });
  };

  return (
    <div id="setup-roadmap">
      <Row className="select-organisation-wrapper">
        <Col span={24}>
          <Space size={20}>
            <div>Setup Roadmap for</div>
            <Select
              allowClear
              showSearch
              className="select-organisation-dropdown"
              placeholder="Organization"
              options={organisationOptions}
              onChange={setSelectedOrg}
              value={selectedOrg}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
              }
            />
          </Space>
        </Col>
      </Row>
      {isEmpty(formValue) ? (
        <div className="loading-wrapper">
          <Spin />
        </div>
      ) : (
        <div id="webform">
          <Webform
            forms={formValue}
            onFinish={onFinish}
            submitButtonSetting={{
              loading: false,
              disabled: !selectedOrg,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SetupRoadmap;
