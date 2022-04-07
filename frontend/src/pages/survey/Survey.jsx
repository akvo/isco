import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Select, Button, Space } from "antd";
import WebformPage from "./WebformPage";
import { api, store } from "../../lib";

const Survey = () => {
  const user = store.useState((s) => s.user);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formLoaded, setFormLoaded] = useState(null);
  const [formOptions, setFormOptions] = useState([]);
  const [savedSubmissions, setSavedSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      Promise.all([api.get("/webform/options"), api.get("/data/saved")])
        .then((res) => {
          const [webforms, savedData] = res;
          setFormOptions(webforms.data);
          setSavedSubmissions(savedData.data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [user]);

  const handleOnChangeNewForm = (val) => {
    setSelectedForm(val);
  };

  const onOkModal = () => {
    setFormLoaded(null);
    store.update((s) => {
      s.notificationModal = {
        ...s.notificationModal,
        saveFormData: {
          ...s.notificationModal.saveFormData,
          visible: false,
        },
      };
    });
    setTimeout(() => {
      setFormLoaded(selectedForm);
    }, 100);
  };

  const handleOnClickOpenNewForm = () => {
    if (formLoaded) {
      // show modal
      store.update((s) => {
        s.notificationModal = {
          ...s.notificationModal,
          saveFormData: {
            ...s.notificationModal.saveFormData,
            visible: true,
            onOk: () => onOkModal(),
          },
        };
      });
      return;
    }
    if (selectedForm) {
      setFormLoaded(selectedForm);
      return;
    }
  };

  return (
    <div id="survey" className="container">
      <Row>
        <p>
          Data security provisions for the data that will be submitted as part
          of this survey.
        </p>
      </Row>
      <Row
        className="form-selector-container"
        align="middle"
        justify="space-between"
        gutter={[12, 12]}
      >
        <Col span={16} className="saved-form-wrapper">
          <p>Pick a previously saved form</p>
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={14}>
              <Select
                showSearch
                className="bg-grey"
                placeholder="Select..."
                options={savedSubmissions.map((x) => ({
                  label: x.name,
                  value: x.id,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Col>
            <Col span={10}>
              <Space>
                <Button>Refresh</Button>
                <Button>Open</Button>
                <Button>Collaborators</Button>
              </Space>
            </Col>
          </Row>
        </Col>
        <Col span={8} className="new-form-wrapper">
          <p>Start filling a new form</p>
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col span={18}>
              <Select
                showSearch
                className="bg-grey"
                placeholder="Select..."
                options={formOptions}
                onChange={handleOnChangeNewForm}
                value={selectedForm}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Col>
            <Col span={6}>
              <Button block onClick={handleOnClickOpenNewForm}>
                Open
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <br />
      <hr />
      {/* Webform load here */}
      {formLoaded && (
        <WebformPage formId={formLoaded} setFormLoaded={setFormLoaded} />
      )}
    </div>
  );
};

export default Survey;
