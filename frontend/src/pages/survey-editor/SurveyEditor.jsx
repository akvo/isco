import React, { useEffect, useMemo, useState } from "react";
import "./style.scss";
import { Row, Col, Card, Tabs, Typography, Space } from "antd";
import { MainEditor, Preview, MainEditorSkeleton } from "../../components";
import { useParams } from "react-router-dom";
import { store, api } from "../../lib";
import { defaultRepeatingObject, defaultOption } from "../../lib/store";
import { generateID } from "../../lib/util";

const { TabPane } = Tabs;
const { Title } = Typography;

const SurveyEditor = () => {
  const { formId } = useParams();
  const { isLoggedIn, surveyEditor } = store.useState((s) => s);
  const { questionGroup, version } = surveyEditor;
  const versionNumber = version ? version : 0.0;
  const [isLoadingSurveyEditor, setIsLoadingSurveyEditor] = useState(false);

  useEffect(() => {
    if (formId && isLoggedIn) {
      setIsLoadingSurveyEditor(true);
      api
        .get(`/survey_editor/${formId}`)
        .then((res) => {
          const { data } = res;
          store.update((s) => {
            s.surveyEditor = {
              ...s.surveyEditor,
              id: data?.id,
              name: data?.name,
              description: data?.description,
              languages: data?.languages || [],
              version: data?.version,
              enable_prefilled_value: data?.enable_prefilled_value || false,
              questionGroup: data?.question_group?.map((qg) => {
                // check for disableDelete a group based on question disableDelete value
                const questionDisableDelete = qg?.question?.filter(
                  (q) => q?.disableDelete
                );
                return {
                  ...qg,
                  disableDelete: questionDisableDelete?.length ? true : false,
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
        })
        .finally(() => {
          setIsLoadingSurveyEditor(false);
        });
    }
  }, [formId, isLoggedIn]);

  const countAllQuestion = useMemo(() => {
    return questionGroup?.flatMap((q) => q?.question)?.length;
  }, [questionGroup]);

  const countMandatory = useMemo(() => {
    return questionGroup
      ?.flatMap((q) => q?.question)
      ?.filter((q) => q?.mandatory)?.length;
  }, [questionGroup]);

  return (
    <div id="survey-editor">
      <Row className="container bg-grey">
        <Col span={24}>
          <Card className="card-wrapper">
            <Tabs
              destroyInactiveTabPane={true}
              tabBarExtraContent={
                <Space align="middle">
                  <Title
                    level={5}
                  >{`${countMandatory} / ${countAllQuestion}`}</Title>
                  <div>Mandatory Questions</div>|
                  <div>Version: {versionNumber}</div>
                </Space>
              }
            >
              <TabPane tab="Form Editor" key="form-editor">
                {isLoadingSurveyEditor ? (
                  <MainEditorSkeleton />
                ) : (
                  <MainEditor />
                )}
              </TabPane>
              <TabPane
                tab="Preview"
                key="preview"
                disabled={isLoadingSurveyEditor}
              >
                <Preview />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SurveyEditor;
