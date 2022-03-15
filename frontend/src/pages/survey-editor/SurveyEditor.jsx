import React from "react";
import "./style.scss";
import { Row, Col, Card, Tabs } from "antd";
import { MainEditor } from "../../components";

const { TabPane } = Tabs;

const SurveyEditor = () => {
  return (
    <div id="survey-editor">
      <Row className="container bg-grey">
        <Col span={24}>
          <Card className="card-wrapper">
            <Tabs tabBarExtraContent={<>0/1 Mandatory Questions</>}>
              <TabPane tab="Form Editor" key="form-editor">
                <MainEditor />
              </TabPane>
              <TabPane tab="Preview" key="preview">
                Content Preview
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SurveyEditor;
