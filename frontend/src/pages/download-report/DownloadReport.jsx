import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Select, Card, Space, Button } from "antd";
import { api, store } from "../../lib";

const { Title } = Typography;

const DownloadReport = () => {
  const { member_type } = store.useState((s) => s.optionValues);
  const [forms, setForms] = useState([]);

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
                    placeholder="Questionnaire"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    options={forms}
                  />
                  <Select
                    showArrow
                    showSearch
                    allowClear
                    className="custom-dropdown-wrapper bg-grey"
                    placeholder="Member Type"
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
                  />
                  <Button ghost type="primary">
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
