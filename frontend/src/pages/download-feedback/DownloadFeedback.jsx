import React, { useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Select, Space, Button } from "antd";
import { api } from "../../lib";
import { useNotification } from "../../util";
import { MonitoringRoundSelector } from "../../components";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const handleSelectFilter = (input, option) =>
  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const DownloadFeedback = () => {
  const { notify } = useNotification();

  const [iscoSelected, setIscoSelected] = useState(null);
  const [selectedMonitoringRound, setSelectedMonitoringRound] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [iscoOptions, setIscoOptions] = React.useState([]);

  React.useEffect(() => {
    api.get("/isco_type/mine").then((res) => {
      setIscoOptions(
        res.data
          .filter((x) => x.id !== 1 || x.name.toLowerCase() !== "all")
          .map((x) => ({
            label: x.name,
            value: x.id,
          }))
      );
    });
  }, []);

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
        const dateStr = new Date()
          .toISOString()
          .split("T")[0]
          .replaceAll("-", "");
        link.setAttribute("download", `feedback_export_${dateStr}.xlsx`);
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
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Title className="page-title" level={3}>
                Download Feedback
              </Title>
            </Col>
          </Row>
          <Row
            className="filter-wrapper"
            align="middle"
            justify="space-between"
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Space wrap size={16}>
                <Select
                  showSearch
                  className="isco-dropdown-wrapper"
                  placeholder="Select ISCO Type (Optional)"
                  optionFilterProp="children"
                  filterOption={handleSelectFilter}
                  options={iscoOptions}
                  value={iscoSelected}
                  onChange={(val) => setIscoSelected(val)}
                  {...globalSelectProps}
                />
                <MonitoringRoundSelector
                  value={selectedMonitoringRound}
                  onChange={setSelectedMonitoringRound}
                  className="monitoring-round-selector"
                  style={{ width: "12rem" }}
                />
                <Button
                  type="primary"
                  ghost
                  disabled={!selectedMonitoringRound}
                  loading={downloading}
                  onClick={handleDownloadFeedback}
                >
                  Download Feedback
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DownloadFeedback;
