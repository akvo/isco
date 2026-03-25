import React, { useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Select, Card, Space, Button } from "antd";
import { api, store } from "../../lib";
import { useNotification } from "../../util";
import { MonitoringRoundSelector } from "../../components";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const handleSelectFilter = (input, option) =>
  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const DownloadFeedback = () => {
  const { user } = store.useState((s) => s);
  const { isco_type } = store.useState((s) => s.optionValues);
  const { notify } = useNotification();

  const [iscoSelected, setIscoSelected] = useState(null);
  const [selectedMonitoringRound, setSelectedMonitoringRound] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [allowedIsco, setAllowedIsco] = React.useState([]);

  React.useEffect(() => {
    if (user?.role === "member_admin") {
      api.get("/isco_type/mine").then((res) => {
        setAllowedIsco(
          res.data.map((x) => ({
            label: x.name,
            value: x.id,
          }))
        );
      });
    }
  }, [user]);

  const iscoOptions =
    user?.role === "member_admin"
      ? allowedIsco
      : isco_type.length
      ? isco_type
          .filter((x) => x.id !== 1 || x.name.toLowerCase() !== "all")
          .map((x) => ({
            label: x.name,
            value: x.id,
          }))
      : [];

  const handleDownloadFeedback = () => {
    if (!selectedMonitoringRound) {
      notify({
        type: "error",
        message: "Monitoring Round is mandatory",
      });
      return;
    }
    setDownloading(true);
    let params = `monitoring_round=${selectedMonitoringRound}`;
    if (iscoSelected) {
      params += `&isco_type_id=${iscoSelected}`;
    }
    api
      .get(`/feedback/download?${params}`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "feedback_export.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((e) => {
        const { status } = e.response || {};
        notify({
          type: "error",
          message:
            status === 404
              ? "No feedback data available."
              : "Something went wrong.",
        });
        console.error(e);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  return (
    <div id="download-feedback">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Download Feedback
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
                        placeholder="Select ISCO Type (Optional)"
                        optionFilterProp="children"
                        filterOption={handleSelectFilter}
                        options={iscoOptions}
                        value={iscoSelected}
                        onChange={(val) => setIscoSelected(val)}
                        style={{ width: "15rem" }}
                        {...globalSelectProps}
                      />
                      <MonitoringRoundSelector
                        value={selectedMonitoringRound}
                        onChange={setSelectedMonitoringRound}
                        className="bg-grey"
                        style={{ minWidth: "150px", width: "175px" }}
                      />
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Button
                      ghost
                      type="primary"
                      disabled={!selectedMonitoringRound}
                      loading={downloading}
                      onClick={handleDownloadFeedback}
                    >
                      Download Feedback
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DownloadFeedback;
