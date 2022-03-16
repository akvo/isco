import React, { useEffect } from "react";
import "./style.scss";
import { Row, Col, Card, Tabs } from "antd";
import { MainEditor } from "../../components";
import { useParams } from "react-router-dom";
import { store, api } from "../../lib";
import { defaultRepeatingObject } from "../../lib/store";
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
                  if (
                    !q?.repeating_objects ||
                    q?.repeating_objects?.length === 0
                  ) {
                    return {
                      ...q,
                      repeating_objects: [
                        { ...defaultRepeatingObject, id: generateID() },
                      ],
                    };
                  }
                  return q;
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
