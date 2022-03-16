import React, { useEffect } from "react";
import "./style.scss";
import { Row, Col, Card, Tabs } from "antd";
import { MainEditor } from "../../components";
import { useParams } from "react-router-dom";
import { store, api } from "../../lib";
import { defaultRepeatingObject, defaultOption } from "../../lib/store";
import { generateID } from "../../lib/util";

const { TabPane } = Tabs;

const SurveyEditor = () => {
  const { formId } = useParams();

  useEffect(() => {
    api
      .get(`survey_editor/${formId}`)
      .then((res) => {
        const { data } = res;
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            id: data?.id,
            name: data?.name,
            description: data?.description,
            languages: data?.languages,
            questionGroup: data?.question_group?.map((qg) => {
              return {
                ...qg,
                question: qg?.question?.map((q) => {
                  let option = q?.option;
                  let repeating_objects = q?.repeating_objects;
                  if (option?.length === 0) {
                    option = [{ ...defaultOption, id: generateID() }];
                  }
                  if (!repeating_objects || repeating_objects?.length === 0) {
                    repeating_objects = [
                      { ...defaultRepeatingObject, id: generateID() },
                    ];
                  }
                  return {
                    ...q,
                    option: option,
                    repeating_objects: repeating_objects,
                  };
                }),
              };
            }),
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  }, []);

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
