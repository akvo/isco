import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Select, Button, Space, Alert } from "antd";
import WebformPage from "./WebformPage";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { uiText, webformContent } from "../../static";
import { FiRefreshCw } from "react-icons/fi";

const Survey = () => {
  const { notify } = useNotification();

  const { user, optionValues, language } = store.useState((s) => s);
  const { organisation } = optionValues;
  const { active: activeLang } = language;

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
  const [isAddCollaboratorLoading, setIsAddCollaboratorLoading] =
    useState(false);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  // previous submission
  const [prevSubmissionOptions, setPrevSubmissionOptions] = useState([]);
  const [selectedPrevSubmission, setSelectedPrevSubmission] = useState(null);

  const handleOnClickDataSecurity = () => {
    store.update((s) => {
      s.notificationModal = {
        ...s.notificationModal,
        dataSecurity: {
          ...s.notificationModal.dataSecurity,
          visible: true,
        },
      };
    });
  };

  const selectedFormType = useMemo(() => {
    if (!formOptions.length) {
      return null;
    }
    return formOptions.find((f) => f.value === selectedForm)?.form_type;
  }, [selectedForm, formOptions]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const content = useMemo(() => {
    return webformContent(handleOnClickDataSecurity)[activeLang];
  }, [activeLang]);

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
    if (selectedFormType === "project" && selectedForm) {
      api.get(`/previous-project-submission/${selectedForm}`).then((res) => {
        const values = res.data.map((d) => ({
          label: d.datapoint_name,
          value: d.id,
        }));
        setPrevSubmissionOptions(values);
      });
    }
  }, [selectedFormType, selectedForm]);

  useEffect(() => {
    if ((user && reloadDropdownValue) || text?.infoSubmissionDropdown) {
      Promise.all([api.get("/webform/options"), api.get("/data/saved")])
        .then((res) => {
          const [webforms, savedData] = res;
          const transformWebforms = webforms.data?.map((x) => {
            let newLabel = x?.label;
            if (x?.disabled) {
              newLabel = `${newLabel} ${text.infoSubmissionDropdown}`;
            }
            return {
              ...x,
              label: newLabel,
            };
          });
          setFormOptions(transformWebforms);
          setSavedSubmissions(savedData.data);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setReloadDropdownValue(false);
        });
    }
  }, [user, reloadDropdownValue, text]);

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

  const handleOnChangePreviousSubmission = (val) => {
    setSelectedPrevSubmission(val);
  };

  const resetNewFormDropdown = () => {
    setPrevSubmissionOptions([]);
    setSelectedPrevSubmission(null);
    setSelectedForm(null);
  };

  const resetCollaboratorDropdown = () => {
    setDisableAddCollaboratorButton(true);
    setShowCollaboratorForm(false);
    setCollaborators(null);
    setSelectedCollaborators([]);
  };

  const resetSavedFormDropdown = () => {
    resetCollaboratorDropdown();
    setSelectedSavedSubmission(null);
  };

  const handleOnChangeSavedSubmissionDropdown = (dataId) => {
    resetCollaboratorDropdown();
    const findData = savedSubmissions.find((x) => x.id === dataId);
    // disable add collaborator button
    if (
      user.organisation.name === findData.organisation &&
      findData.form_type === "project"
    ) {
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
    resetSavedFormDropdown();
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

  const handleOnClickOpenPrevSubmission = () => {
    resetSavedFormDropdown();
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
    resetCollaboratorDropdown();
    resetNewFormDropdown();
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
      setIsAddCollaboratorLoading(true);
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
        })
        .finally(() => {
          setIsAddCollaboratorLoading(false);
        });
    }
  };

  return (
    <div id="survey" className="container">
      <Row>
        <p>{content.dataSecurityText}</p>
      </Row>
      <Row
        className="form-selector-container"
        align="top"
        justify="space-between"
        gutter={[48, 24]}
      >
        <Col lg={24} xl={16} className="saved-form-wrapper">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Saved Submissions */}
            <div>
              <p>{text.formPickPreviousSavedForms}</p>
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col flex={1}>
                  <Select
                    showSearch
                    className="bg-grey"
                    options={savedSubmissions.map((x) => ({
                      label: `${x.name}${
                        x.locked_by && x.locked_by !== user.id
                          ? ` (locked by ${x.locked_by_user})`
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
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      ghost
                      loading={reloadCollaborator}
                      onClick={() => setReloadDropdownValue(true)}
                      icon={<FiRefreshCw />}
                      style={{ lineHeight: "30px" }}
                    />
                    <Button onClick={handleOnClickOpenSavedForm}>
                      {text.btnOpen}
                    </Button>
                    <Button
                      disabled={disableAddCollaboratorButton}
                      onClick={handleShowCollaboratorForm}
                    >
                      {text.btnCollaborators}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            {/* Collaborators */}
            {showCollaboratorForm && (
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col flex={1}>
                  <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    className="bg-grey"
                    options={organisationOptions}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    value={selectedCollaborators}
                    onChange={handleOnChangeCollaborators}
                  />
                </Col>
                <Col>
                  <Space>
                    <Button
                      onClick={handleOnClickAddCollaborator}
                      disabled={
                        !selectedCollaborators.length ||
                        disableAddCollaboratorButton
                      }
                      loading={isAddCollaboratorLoading}
                    >
                      {text.btnAdd}
                    </Button>
                    <Button onClick={() => setShowCollaboratorForm(false)}>
                      {text.btnClose}
                    </Button>
                  </Space>
                </Col>
              </Row>
            )}
          </Space>
        </Col>
        <Col lg={24} xl={8} className="new-form-wrapper">
          <p>{text.formStartFillingNewForm}</p>
          <Row align="middle" justify="space-between" gutter={[12, 12]}>
            <Col flex={1}>
              <Select
                showSearch
                className="bg-grey"
                options={formOptions}
                onChange={handleOnChangeNewForm}
                value={selectedForm}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Col>
            {selectedFormType !== "project" && (
              <Col>
                <Button block onClick={handleOnClickOpenNewForm}>
                  {text.btnOpen}
                </Button>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      {/* Previous Submission Panel */}
      {selectedFormType === "project" && (
        <div className="previous-submission-container">
          <p>{text.formPreviousYearSubmission}</p>
          <Row align="top" justify="space-between" gutter={[12, 12]}>
            <Col flex={1}>
              <Select
                showSearch
                className="bg-grey"
                options={prevSubmissionOptions}
                onChange={handleOnChangePreviousSubmission}
                value={selectedPrevSubmission}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Col>
            <Col>
              <Button block onClick={handleOnClickOpenPrevSubmission}>
                {text.btnOpen}
              </Button>
            </Col>
          </Row>
        </div>
      )}
      {/* EOL Previous Submission Panel */}
      <br />
      <hr />
      {/* Webform load here */}
      {formLoaded && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Alert type="warning" showIcon message={text.bannerSaveSurvey} />
          <WebformPage
            formId={formLoaded}
            setFormLoaded={setFormLoaded}
            selectedSavedSubmission={selectedSavedSubmission}
            setReloadDropdownValue={setReloadDropdownValue}
            selectedFormType={selectedFormType}
            selectedPrevSubmission={selectedPrevSubmission}
            setShowCollaboratorForm={setShowCollaboratorForm}
            setCollaborators={setCollaborators}
            setSelectedCollaborators={setSelectedCollaborators}
          />
        </Space>
      )}
    </div>
  );
};

export default Survey;
