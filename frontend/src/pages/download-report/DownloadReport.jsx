import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Select, Card, Space, Button, Modal } from "antd";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import ReactCodeInput from "react-verification-code-input";

const { Title } = Typography;

const DownloadReport = () => {
  const { member_type } = store.useState((s) => s.optionValues);
  const { notify } = useNotification();

  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);
  const [memberSelected, setMemberSelected] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
        }, 1000);
      })
      .catch((e) => {
        const { status } = e.response;
        notify({
          type: "error",
          message:
            status === 404 ? "Invalid OTP Code." : "Something went wrong.",
        });
        console.error(e);
      })
      .finally(() => {
        setVerifying(false);
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
                Download Report
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card className="form-wrapper">
                <Space size={24}>
                  <Select
                    showArrow
                    showSearch
                    allowClear
                    className="custom-dropdown-wrapper bg-grey"
                    placeholder="Select Questionnaire"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    options={forms}
                    value={formSelected}
                    onChange={(val) => setFormSelected(val)}
                  />
                  <Select
                    showArrow
                    showSearch
                    allowClear
                    className="custom-dropdown-wrapper bg-grey"
                    placeholder="Select Member Type"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    options={
                      member_type.length
                        ? member_type.map((x) => ({
                            label: x.name,
                            value: x.id,
                          }))
                        : []
                    }
                    value={memberSelected}
                    onChange={(val) => setMemberSelected(val)}
                  />
                  <Button
                    ghost
                    type="primary"
                    disabled={!formSelected}
                    loading={isGenerating}
                    onClick={handleGenerateReport}
                  >
                    Generate
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal OTP Code */}
      <Modal
        title="Input OTP Code"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        centered
        destroyOnClose
        className="otp-code-modal"
        footer=""
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
            loading={verifying}
            className="otp-code-input"
          />
          <Button
            ghost
            className="button-download"
            type="primary"
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
