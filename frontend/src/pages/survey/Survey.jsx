import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Select, Button, Space } from "antd";
import WebformPage from "./WebformPage";
import { api, store } from "../../lib";
import { useNotification } from "../../util";

const Survey = () => {
  const { notify } = useNotification();

  const { user, optionValues } = store.useState((s) => s);
  const { organisation } = optionValues;

  const [selectedForm, setSelectedForm] = useState(null);
  const [formLoaded, setFormLoaded] = useState(null);
  const [formOptions, setFormOptions] = useState([]);
  const [savedSubmissions, setSavedSubmissions] = useState([]);
  const [selectedSavedSubmission, setSelectedSavedSubmission] = useState(null);
  const [reloadDropdownValue, setReloadDropdownValue] = useState(true);

  const [collaborators, setCollaborators] = useState(null);
  const [reloadCollaborator, setReloadCollaborator] = useState(false);
  const [disableAddCollaboratorButton, setDisableAddCollaboratorButton] =
    useState(true);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  const organisationOptions = useMemo(() => {
    const transform = organisation
      .filter((o) => o.id !== user.organisation.id)
      .map((x) => ({
        label: x.name,
        value: x.id,
      }));
    return transform;
  }, [organisation, user]);

  useEffect(() => {
    if (user && reloadDropdownValue) {
      Promise.all([api.get("/webform/options"), api.get("/data/saved")])
        .then((res) => {
          const [webforms, savedData] = res;
          setFormOptions(webforms.data);
          setSavedSubmissions(savedData.data);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setReloadDropdownValue(false);
        });
    }
  }, [user, reloadDropdownValue]);

  useEffect(() => {
    if (
      (selectedSavedSubmission && !collaborators) ||
      (selectedSavedSubmission && reloadCollaborator)
    ) {
      api
        .get(`/collaborator/${selectedSavedSubmission.id}`)
        .then((res) => {
          setCollaborators(res.data);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setReloadCollaborator(false);
        });
    }
  }, [selectedSavedSubmission, collaborators, reloadCollaborator]);

  const handleOnChangeNewForm = (val) => {
    setSelectedForm(val);
  };

  const handleOnChangeSavedSubmissionDropdown = (dataId) => {
    const findData = savedSubmissions.find((x) => x.id === dataId);
    // disable add collaborator button
    if (user.organisation.name === findData.organisation) {
      setDisableAddCollaboratorButton(false);
    }
    setSelectedSavedSubmission(findData);
  };

  const handleOnChangeCollaborators = (val) => {
    setSelectedCollaborators(val);
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
      if (selectedForm) {
        setFormLoaded(selectedForm);
        return;
      }
      if (selectedSavedSubmission) {
        setFormLoaded(selectedSavedSubmission.form);
        return;
      }
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

  const handleOnClickOpenSavedForm = () => {
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
    if (selectedSavedSubmission) {
      setFormLoaded(selectedSavedSubmission.form);
      return;
    }
  };

  const handleShowCollaboratorForm = () => {
    setShowCollaboratorForm(true);
    // set collaborator form value
    if (collaborators && collaborators.length) {
      setSelectedCollaborators(collaborators.map((x) => x.organisation));
    }
  };

  const handleOnClickAddCollaborator = () => {
    if (selectedCollaborators.length) {
      const apiCall = (url, payload, header) =>
        !collaborators
          ? api.post(url, payload, header)
          : api.put(url, payload, header);
      const payload = selectedCollaborators.map((x) => ({ organisation: x }));
      apiCall(`/collaborator/${selectedSavedSubmission.id}`, payload, {
        "content-type": "application/json",
      })
        .then(() => {
          notify({
            type: "success",
            message: "Collaborator added successfully.",
          });
          setReloadCollaborator(true);
        })
        .catch((e) => {
          console.error(e);
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        });
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
        align="top"
        justify="space-between"
        gutter={[12, 12]}
      >
        <Col span={16} className="saved-form-wrapper">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Saved Submissions */}
            <div>
              <p>Pick a previously saved form</p>
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col span={14}>
                  <Select
                    showSearch
                    className="bg-grey"
                    placeholder="Select saved submissions"
                    options={savedSubmissions.map((x) => ({
                      label: `${x.name}${
                        x.locked_by && x.locked_by !== user.id
                          ? " (locked)"
                          : ""
                      }`,
                      value: x.id,
                      disabled: x.locked_by ? x.locked_by !== user.id : false,
                    }))}
                    value={selectedSavedSubmission?.id}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onChange={handleOnChangeSavedSubmissionDropdown}
                  />
                </Col>
                <Col span={10}>
                  <Space>
                    <Button>Refresh</Button>
                    <Button onClick={handleOnClickOpenSavedForm}>Open</Button>
                    <Button
                      disabled={disableAddCollaboratorButton}
                      onClick={handleShowCollaboratorForm}
                    >
                      Add Collaborators
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            {/* Collaborators */}
            {showCollaboratorForm && (
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col span={14}>
                  <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    className="bg-grey"
                    placeholder="Select collaborator"
                    options={organisationOptions}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    value={selectedCollaborators}
                    onChange={handleOnChangeCollaborators}
                  />
                </Col>
                <Col span={10}>
                  <Button
                    onClick={handleOnClickAddCollaborator}
                    disabled={!selectedCollaborators.length}
                  >
                    Add
                  </Button>
                </Col>
              </Row>
            )}
          </Space>
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
        <WebformPage
          formId={formLoaded}
          setFormLoaded={setFormLoaded}
          selectedSavedSubmission={selectedSavedSubmission}
          setReloadDropdownValue={setReloadDropdownValue}
        />
      )}
    </div>
  );
};

export default Survey;
