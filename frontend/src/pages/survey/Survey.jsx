import React, { useState, useEffect, useMemo, useRef } from "react";
import "./style.scss";
import { Row, Col, Select, Button, Space, Alert, Tooltip, Modal } from "antd";
import WebformPage from "./WebformPage";
import { api, store } from "../../lib";
import { useNotification, useIdle } from "../../util";
import { uiText, webformContent } from "../../static";
import { FiRefreshCw, FiInfo } from "react-icons/fi";
import orderBy from "lodash/orderBy";
import Countdown from "react-countdown";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const Survey = () => {
  const { notify } = useNotification();
  const webformRef = useRef();

  const { user, optionValues, language } = store.useState((s) => s);
  const { organisation } = optionValues;
  const { active: activeLang } = language;

  const [selectedForm, setSelectedForm] = useState(null);
  const [formLoaded, setFormLoaded] = useState(null);
  const [formOptions, setFormOptions] = useState([]);
  const [formOptionsNotTransformed, setFormOptionsNotTransformed] = useState(
    []
  );
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
  const [clearForm, setClearForm] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);

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

  // to show prefilled value select dropdown
  const selectedFormEnablePrefilledValue = useMemo(() => {
    if (!formOptionsNotTransformed.length || !selectedForm) {
      return null;
    }
    return formOptionsNotTransformed.find((f) => f.value === selectedForm)
      ?.enable_prefilled_value;
  }, [selectedForm, formOptionsNotTransformed]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const content = useMemo(() => {
    return webformContent(handleOnClickDataSecurity)[activeLang];
  }, [activeLang]);

  const showPrevSubmissionDropdown = useMemo(() => {
    return (
      selectedFormEnablePrefilledValue &&
      prevSubmissionOptions?.filter((x) => x.value !== "")?.length > 0
    );
  }, [selectedFormEnablePrefilledValue, prevSubmissionOptions]);

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
    if (selectedFormEnablePrefilledValue && selectedForm) {
      api.get(`/previous-project-submission/${selectedForm}`).then((res) => {
        const values = res.data.map((d) => ({
          label: d.datapoint_name,
          value: d.id,
        }));
        values.push({
          label: "",
          value: "",
        });
        setPrevSubmissionOptions(orderBy(values, ["value"]));
      });
    }
  }, [
    selectedFormEnablePrefilledValue,
    selectedForm,
    text.formPreviousYearSubmissionEmptyOption,
  ]);

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
              value: x.value,
              label: newLabel,
              disabled: x.disabled,
            };
          });
          setFormOptions(transformWebforms);
          setSavedSubmissions(savedData.data);
          setFormOptionsNotTransformed(webforms.data);
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

  const resetCollaboratorDropdown = (
    disableAddCollaboratorDropdownValue = true,
    resetCollaboratorDropdownListValue = false
  ) => {
    setDisableAddCollaboratorButton(disableAddCollaboratorDropdownValue);
    setShowCollaboratorForm(false);
    if (resetCollaboratorDropdownListValue) {
      setCollaborators(null);
    }
    setSelectedCollaborators([]);
  };

  const resetSavedFormDropdown = () => {
    resetCollaboratorDropdown(true, true);
    setSelectedSavedSubmission(null);
  };

  const handleOnChangeSavedSubmissionDropdown = (dataId) => {
    resetCollaboratorDropdown(true, true);
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
    if (selectedPrevSubmission === "" || !selectedPrevSubmission) {
      setClearForm(true);
    }
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
    const disableAddCollaboratorDropdownValue =
      selectedSavedSubmission?.form_type === "project" ? false : true;
    resetCollaboratorDropdown(disableAddCollaboratorDropdownValue, false);
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
    if (selectedFormEnablePrefilledValue && selectedPrevSubmission) {
      // don't save collaborator directly if prefilled project submission
      // collaborators will send as a query params when first time (POST)
      // submit/save new project submission with prefilled value
      return;
    }
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

  // handle idle
  const handleIdle = () => {
    // check session/token expiration
    api
      .get("/user/me")
      .then((res) => {
        const { expired } = res.data;
        const now = new Date();
        const expiredDate = new Date(expired);
        const timeDifference = expiredDate - now;
        if (timeDifference > 0) {
          setRemainingTime(expired);
        }
      })
      .catch(() => {
        setRemainingTime(false);
      })
      .finally(() => {
        setShowSessionModal(true);
      });
  };

  const { isIdle } = useIdle({ onIdle: handleIdle, idleTime: 0.08 });

  const handleLogout = () => {
    if (cookies?.AUTH_TOKEN) {
      removeCookie("AUTH_TOKEN");
      api.setToken(null);
      store.update((s) => {
        s.isLoggedIn = false;
        s.user = null;
      });
      navigate("/login");
    }
  };

  const handleStayLoggedIn = () => {
    setShowSessionModal(false);
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
            {!showPrevSubmissionDropdown && (
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
      {showPrevSubmissionDropdown && (
        <div className="previous-submission-container">
          <Space align="middle">
            <p>{text.formPreviousYearSubmission}</p>
            <Tooltip title={text.prefilledMismatchWarming} placement="right">
              <FiInfo style={{ fontSize: 16 }} />
            </Tooltip>
          </Space>
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
            webformRef={webformRef}
            formId={formLoaded}
            setFormLoaded={setFormLoaded}
            selectedSavedSubmission={selectedSavedSubmission}
            setReloadDropdownValue={setReloadDropdownValue}
            selectedFormEnablePrefilledValue={selectedFormEnablePrefilledValue}
            selectedPrevSubmission={selectedPrevSubmission}
            setShowCollaboratorForm={setShowCollaboratorForm}
            setCollaborators={setCollaborators}
            selectedCollaborators={selectedCollaborators}
            setSelectedCollaborators={setSelectedCollaborators}
            // send resetSavedFormDropdown to reset the collaborator button
            // and dropdown list after submit/saved submission
            resetSavedFormDropdown={resetSavedFormDropdown}
            clearForm={clearForm}
            setClearForm={setClearForm}
          />
        </Space>
      )}

      {/* Session modal */}
      <Modal
        title="Inactivity Warning"
        visible={isIdle && showSessionModal}
        footer={null}
        closable={false}
      >
        {remainingTime ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>Your session will expire in:</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              <Countdown date={remainingTime} daysInHours={true} />
            </div>
            <Space style={{ width: "100%", float: "right" }}>
              <Button type="danger" block onClick={handleLogout}>
                Re-Login
              </Button>
              <Button
                type="primary"
                block
                style={{ border: "none", minHeight: 0, borderRadius: 0 }}
                onClick={handleStayLoggedIn}
              >
                Stay Logged In
              </Button>
            </Space>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              Your session has expired, please log in again
            </div>
            <Space style={{ width: "100%", float: "right" }}>
              <Button type="danger" block onClick={handleLogout}>
                Re-Login
              </Button>
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Survey;
