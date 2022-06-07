import React from "react";
import "./style.scss";
import { Row, Col, Typography, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div id="admin">
      <Row className="container bg-grey">
        <Col span={24}>
          <Title className="page-title" level={3}>
            Welcome Admin
          </Title>
          <Row className="card-row" gutter={[20, 20]}>
            <Col md={24} lg={12}>
              <Card
                className="card-wrapper"
                title={<Title level={5}>Manage Users</Title>}
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/manage-user")}
                  >
                    Manage Users
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>Manage Surveys</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/manage-survey")}
                  >
                    Manage Surveys
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>View Submission Progress</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/submission-progress")}
                  >
                    View Submission Progress
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>Manage Download</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/manage-download")}
                  >
                    Manage Download
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>Manage Members</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/manage-member")}
                  >
                    Manage members
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>Manage Data</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/download-report")}
                  >
                    Manage Data
                  </Button>
                </div>
              </Card>
            </Col>
            <Col md={24} lg={12}>
              <Card
                title={<Title level={5}>Data Cleaning</Title>}
                className="card-wrapper"
              >
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    block
                    onClick={() => navigate("/data-cleaning")}
                  >
                    Data Cleaning
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
