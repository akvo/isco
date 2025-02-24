import React, { useEffect, useState } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Select,
  Card,
  Space,
  Button,
  Modal,
  InputNumber,
} from "antd";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import ReactCodeInput from "react-verification-code-input";
import { MonitoringRoundSelector } from "../../components";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const handleSelectFilter = (input, option) =>
  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const DownloadReport = () => {
  const {
    member_type,
    isco_type,
    // organisation
  } = store.useState((s) => s.optionValues);
  const { notify } = useNotification();

  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);
  const [memberSelected, setMemberSelected] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState([]);
  const [selectedMonitoringRound, setSelectedMonitoringRound] = useState(null);
  const [iscoSelected, setIscoSelected] = useState(null);
  const [organisationSelected, setOrganisationSelected] = useState(null);

  useEffect(() => {
    if (!forms.length) {
      api
        .get("/form/published")
        .then((res) => {
          const data = res.data.map((x) => ({
            label: x.label,
            value: x.value,
          }));
          setForms(data);
        })
        .catch((e) => console.error(e));
    }
  }, [forms]);

  const handleGenerateReport = () => {
    if (formSelected) {
      setIsGenerating(true);
      let params = `form_id=${formSelected}`;
      if (memberSelected) {
        params += `&member_type=${memberSelected}`;
      }
      if (iscoSelected) {
        params += `&isco_type=${iscoSelected}`;
      }
      if (organisationSelected) {
        params += `&organisation_id=${organisationSelected}`;
      }
      if (selectedMonitoringRound) {
        params += `&monitoring_round=${selectedMonitoringRound}`;
      }
      api
        .post(`/download-summary/new?${params}`)
        .then((res) => {
          setUuid(res.data.uuid);
          setTimeout(() => {
            setShowModal(true);
          }, 500);
        })
        .catch((e) => {
          const { status } = e.response;
          notify({
            type: "error",
            message:
              status === 404 ? "No data available." : "Something went wrong.",
          });
          console.error(e);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  };

  const handleOnCompleteOTPCode = (code) => {
    setVerifying(true);
    const data = new FormData();
    data.append("code", code);
    api
      .post(`/download-summary/file/${uuid}`, data, { responseType: "blob" })
      .then((res) => {
        setTimeout(() => {
          setAllowDownload(res.data);
        }, 500);
      })
      .catch((e) => {
        const { status } = e.response;
        notify({
          type: "error",
          message:
            status === 404 ? "Invalid OTP Code." : "Something went wrong.",
        });
        console.error(e);
        setOtpValue([]);
      })
      .finally(() => {
        setTimeout(() => {
          setVerifying(false);
        }, 500);
      });
  };

  const handleDownloadReport = () => {
    if (allowDownload) {
      const url = window.URL.createObjectURL(allowDownload);
      const link = document.createElement("a");
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setTimeout(() => {
        setOtpValue([]);
        setShowModal(false);
        setAllowDownload(false);
      }, 500);
    }
  };

  return (
    <div id="download-report">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Manage Data
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card className="form-wrapper">
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    <Space size={12}>
                      <Select
                        showArrow
                        showSearch
                        className="custom-dropdown-wrapper bg-grey"
                        placeholder="Select Questionnaire"
                        optionFilterProp="children"
                        filterOption={handleSelectFilter}
                        options={forms}
                        value={formSelected}
                        onChange={(val) => setFormSelected(val)}
                        style={{ width: "8rem" }}
                        {...globalSelectProps}
                      />
                      <MonitoringRoundSelector
                        value={selectedMonitoringRound}
                        onChange={setSelectedMonitoringRound}
                        className="bg-grey"
                        style={{ minWidth: "100px", width: "175px" }}
                      />
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space size={12}>
                      <Select
                        showArrow
                        showSearch
                        className="custom-dropdown-wrapper bg-grey"
                        placeholder="Select Member Type"
                        optionFilterProp="children"
                        filterOption={handleSelectFilter}
                        options={
                          member_type.length
                            ? member_type
                                .filter(
                                  (x) =>
                                    x.id !== 1 || x.name.toLowerCase() !== "all"
                                ) // filter all member type
                                .map((x) => ({
                                  label: x.name,
                                  value: x.id,
                                }))
                            : []
                        }
                        value={memberSelected}
                        onChange={(val) => setMemberSelected(val)}
                        style={{ width: "8rem" }}
                        {...globalSelectProps}
                      />
                      <Select
                        showArrow
                        showSearch
                        className="custom-dropdown-wrapper bg-grey"
                        placeholder="Select ISCO Type"
                        optionFilterProp="children"
                        filterOption={handleSelectFilter}
                        options={
                          isco_type.length
                            ? isco_type
                                .filter(
                                  (x) =>
                                    x.id !== 1 || x.name.toLowerCase() !== "all"
                                ) // filter all member type
                                .map((x) => ({
                                  label: x.name,
                                  value: x.id,
                                }))
                            : []
                        }
                        value={iscoSelected}
                        onChange={(val) => setIscoSelected(val)}
                        style={{ width: "8rem" }}
                        {...globalSelectProps}
                      />
                      <InputNumber
                        className="bg-grey"
                        placeholder="Member ID"
                        controls={false}
                        onChange={(val) => setOrganisationSelected(val)}
                        value={organisationSelected}
                        style={{ background: "#eeeeee" }}
                      />
                      {/* OLD MEMBER SELECTOR
                      <Select
                        showArrow
                        showSearch
                        className="custom-dropdown-wrapper bg-grey"
                        placeholder="Select Organisation"
                        optionFilterProp="children"
                        filterOption={handleSelectFilter}
                        options={
                          organisation.length
                            ? organisation.map((x) => ({
                                label: x.name,
                                value: x.id,
                              }))
                            : []
                        }
                        value={organisationSelected}
                        onChange={(val) => setOrganisationSelected(val)}
                        style={{ width: "8rem" }}
                        {...globalSelectProps}
                      /> */}
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Button
                      ghost
                      type="primary"
                      disabled={!formSelected}
                      loading={isGenerating}
                      onClick={handleGenerateReport}
                    >
                      Generate
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal OTP Code */}
      <Modal
        title="Input OTP Code"
        visible={showModal}
        closable={false}
        closeIcon=""
        centered
        destroyOnClose
        className="otp-code-modal"
        footer=""
        maskClosable={false}
      >
        <Space
          direction="vertical"
          size={24}
          align="center"
          style={{ width: "100%" }}
        >
          <ReactCodeInput
            type="number"
            autoFocus={true}
            fields={6}
            onComplete={handleOnCompleteOTPCode}
            onChange={(val) => setOtpValue([...otpValue, val])}
            loading={verifying}
            className="otp-code-input"
            values={otpValue}
          />
          <Button
            ghost
            size="large"
            type="primary"
            className="button-download"
            disabled={!allowDownload}
            onClick={handleDownloadReport}
          >
            Download
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default DownloadReport;
