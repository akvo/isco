import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Select, Card, Space, Button } from "antd";
import { api, store } from "../../lib";
import { useNotification } from "../../util";

const { Title } = Typography;

const DownloadReport = () => {
  const { member_type } = store.useState((s) => s.optionValues);
  const { notify } = useNotification();

  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);
  const [memberSelected, setMemberSelected] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uuid, setUuid] = useState(null);

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

  console.info(uuid);

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
    </div>
  );
};

export default DownloadReport;
