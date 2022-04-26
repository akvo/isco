import React from "react";
import "./style.scss";
import { Row, Col, Typography, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const loremText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eleifend felis eu tempor porttitor. Suspendisse sit amet nunc nec neque tempus laoreet nec ut velit. Vivamus eleifend purus at iaculis consequat. Cras maximus facilisis elit at vehicula. Proin viverra ipsum egestas scelerisque mattis. Vivamus vel ex quis augue commodo bibendum nec et velit. Curabitur ut lorem sed purus varius tristique. Cras eu metus tincidunt, convallis nisl eget, dapibus risus. Cras semper ullamcorper magna, ut mattis velit semper in. Vestibulum finibus nunc pharetra lorem facilisis suscipit.";

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
                <p>{loremText}</p>
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
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
                <p>{loremText}</p>
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
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
                <p>{loremText}</p>
                <div className="card-footer">
                  <Button
                    type="primary"
                    ghost
                    onClick={() => navigate("/submission-progress")}
                  >
                    View Submission Progress
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
