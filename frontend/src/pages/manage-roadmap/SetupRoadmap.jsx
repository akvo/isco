import React, { useState, useEffect, useMemo } from "react";
import "akvo-react-form/dist/index.css"; /* REQUIRED */
import { Row, Col, Select, Spin, Space } from "antd";
import { Webform } from "akvo-react-form";
import { api, store } from "../../lib";
import isEmpty from "lodash/isEmpty";
import { useNotification } from "../../util";

const SetupRoadmap = ({ setCurrentTab, editDatapoint, setEditDatapoint }) => {
  const { notify } = useNotification();
  const [formValue, setFormValue] = useState({});
  const [initialValue, setInitialValue] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(
    editDatapoint?.organisation_id || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [dataOrgIds, setDataOrgIds] = useState(null);
  const organisations = store.useState((s) => s.optionValues.organisation);

  const organisationOptions = useMemo(() => {
    if (!dataOrgIds) {
      return [];
    }
    return organisations.map((org) => {
      const disabled = dataOrgIds.includes(org.id) ? true : false;
      const label = org.name;
      return {
        label: disabled ? `${label} (Submitted)` : label,
        value: org.id,
        disabled: disabled,
      };
    });
  }, [organisations, dataOrgIds]);

  useEffect(() => {
    let url = "/roadmap-webform";
    if (editDatapoint?.id) {
      url = `${url}?data_id=${editDatapoint.id}`;
    }
    api
      .get(url)
      .then((res) => {
        let orgIds = res.data.organisation_ids;
        if (editDatapoint) {
          orgIds = orgIds.filter((o) => o !== editDatapoint?.organisation_id);
        }
        setDataOrgIds(orgIds);
        setInitialValue(res.data?.initial_value || []);
        const webform = res.data;
        delete webform?.initial_value;
        delete webform?.organisation_ids;
        setFormValue(webform);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [editDatapoint]);

  const onFinish = (values) => {
    setSubmitting(true);
    const findOrg = organisations.find((o) => o.id === selectedOrg);
    if (values?.datapoint) {
      delete values.datapoint;
    }
    const payload = {
      organisation_id: selectedOrg,
      answers: values,
    };
    let method = api.post;
    let url = "/roadmap-webform";
    if (editDatapoint?.id) {
      method = api.put;
      url = `${url}/${editDatapoint.id}`;
    }
    method(url, payload, {
      "content-type": "application/json",
    })
      .then(() => {
        notify({
          type: "success",
          message: `Roadmap for ${findOrg.name} submitted.`,
        });
        setCurrentTab("current-roadmap");
        setEditDatapoint(null);
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      })
      .finally(() => {
        setSubmitting(false);
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
              disabled={editDatapoint}
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
              loading: submitting,
              disabled: !selectedOrg,
            }}
            initialValue={initialValue}
          />
        </div>
      )}
    </div>
  );
};

export default SetupRoadmap;
