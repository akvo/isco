import React, { useState } from "react";
import "./style.scss";
import { Row, Col, Typography, Tabs } from "antd";
import Guidance from "./Guidance";
import SetupRoadmap from "./SetupRoadmap";
import CurrentRoadmap from "./CurrentRoadmap";

const { Title } = Typography;

const roadmapTabs = [
  { key: "guidance", label: "Guidance" },
  { key: "setup-roadmap", label: "Setup Roadmap" },
  { key: "current-roadmap", label: "Current Roadmaps" },
];

const renderTabContent = ({ currentTab, setCurrentTab }) => {
  switch (currentTab) {
    case "setup-roadmap":
      return <SetupRoadmap setCurrentTab={setCurrentTab} />;
    case "current-roadmap":
      return <CurrentRoadmap setCurrentTab={setCurrentTab} />;
    default:
      return <Guidance />;
  }
};

const ManageRoadmap = () => {
  const [currentTab, setCurrentTab] = useState("guidance");

  return (
    <div id="manage-roadmap">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                Manage Roadmap
              </Title>
            </Col>
          </Row>
          <Row className="tab-menu-wrapper">
            <Col span={24}>
              <Tabs activeKey={currentTab} onTabClick={setCurrentTab}>
                {roadmapTabs.map((rt) => (
                  <Tabs.TabPane tab={rt.label} key={rt.key} />
                ))}
              </Tabs>
            </Col>
          </Row>
          <Row className="tab-content-wrapper">
            <Col span={24}>
              {renderTabContent({ currentTab, setCurrentTab })}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ManageRoadmap;
