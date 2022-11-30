import React from "react";
import "./style.scss";
import { Row, Col, Typography, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const adminMenu = [
  {
    title: "Manage Users",
    buttonText: "Manage Users",
    link: "/manage-user",
  },
  {
    title: "Manage Surveys",
    buttonText: "Manage Surveys",
    link: "/manage-survey",
  },
  {
    title: "View Submission Progress",
    buttonText: "View Submission Progress",
    link: "/submission-progress",
  },
  {
    title: "Manage Download",
    buttonText: "Manage Download",
    link: "/manage-download",
  },
  {
    title: "Manage Members",
    buttonText: "Manage Members",
    link: "/manage-member",
  },
  {
    title: "Manage Data",
    buttonText: "Manage Data",
    link: "/download-report",
  },
  {
    title: "Data Cleaning",
    buttonText: "Data Cleaning",
    link: "/data-cleaning",
  },
  {
    title: "Manage Roadmap",
    buttonText: "Manage Roadmap",
    link: "/manage-roadmap",
  },
];

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
            {adminMenu.map((m, mi) => (
              <Col key={`admin-menu-${mi}`} md={24} lg={12}>
                <Card
                  className="card-wrapper"
                  title={<Title level={5}>{m.title}</Title>}
                >
                  <div className="card-footer">
                    <Button
                      type="primary"
                      ghost
                      block
                      onClick={() => navigate(m.link)}
                    >
                      {m.buttonText}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
