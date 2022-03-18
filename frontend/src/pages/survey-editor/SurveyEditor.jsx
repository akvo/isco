import React, { useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Card, Tabs, Typography, Space } from "antd";
import { MainEditor } from "../../components";
import { useParams } from "react-router-dom";
import { store, api } from "../../lib";
import { defaultRepeatingObject, defaultOption } from "../../lib/store";
import { generateID } from "../../lib/util";

const { TabPane } = Tabs;
const { Title } = Typography;

const SurveyEditor = () => {
  const { formId } = useParams();
  const state = store.useState((s) => s?.surveyEditor);

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
                  // add option default
                  if (option?.length === 0) {
                    option = [{ ...defaultOption, id: generateID() }];
                  }
                  // add repeating object default
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
  }, [formId]);

  const countAllQuestion = useMemo(() => {
    return state?.questionGroup?.flatMap((q) => q?.question)?.length;
  }, [state]);

  const countMandatory = useMemo(() => {
    return state?.questionGroup
      ?.flatMap((q) => q?.question)
      ?.filter((q) => q?.mandatory)?.length;
  }, [state]);

  return (
    <div id="survey-editor">
      <Row className="container bg-grey">
        <Col span={24}>
          <Card className="card-wrapper">
            <Tabs
              tabBarExtraContent={
                <Space align="middle">
                  <Title
                    level={5}
                  >{`${countMandatory} / ${countAllQuestion}`}</Title>
                  <div>Mandatory Questions</div>
                </Space>
              }
            >
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
