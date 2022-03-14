import React from "react";
import { Form, Space, Row, Col, Button } from "antd";
import { store } from "../../lib";
import FormEditor from "./FormEditor";
import QuestionGroupEditor from "./QuestionGroupEditor";

const MainEditor = () => {
  const [form] = Form.useForm();
  const state = store.useState((s) => s?.surveyEditor);
  const { questionGroup } = state;

  return (
    <div id="main-form-editor">
      <Form
        form={form}
        name="survey-detail"
        onFinish={(values) => console.log(values)}
        onFinishFailed={({ values, errorFields }) =>
          console.log(values, errorFields)
        }
      >
        <Space direction="vertical" size="large">
          <Row align="middle">
            {/* Form & Question Group */}
            <Col span={24}>
              <Space direction="vertical" size="large">
                <FormEditor form={form} />
                {questionGroup?.map((qg, qgi) => (
                  <QuestionGroupEditor
                    key={`question-group-key-${qgi + 1}`}
                    form={form}
                    index={qgi + 1}
                    questionGroup={qg}
                  />
                ))}
              </Space>
            </Col>
          </Row>
          <Row align="middle">
            {/* Button */}
            <Col span={22}>
              <Row align="middle" justify="space-between">
                <Col span={12} align="start" onClick={() => form.submit()}>
                  <Button>Done</Button>
                </Col>
                <Col span={12} align="end">
                  <Button
                    className="float-right"
                    type="primary"
                    onClick={() => form.submit()}
                  >
                    Deploy
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Space>
      </Form>
    </div>
  );
};

export default MainEditor;
