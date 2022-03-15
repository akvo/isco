import React, { useEffect } from "react";
import { Form, Space, Row, Col, Button } from "antd";
import { store } from "../../lib";
import FormEditor from "./FormEditor";
import QuestionGroupEditor from "./QuestionGroupEditor";

const MainEditor = () => {
  const [form] = Form.useForm();
  const state = store.useState((s) => s?.surveyEditor);
  const formFields = {
    "form-name": state?.name,
    "form-description": state?.description,
    "form-languages": state?.languages,
  };
  const { questionGroup } = state;

  useEffect(() => {
    if (state?.id) {
      // set form fields initial value
      Object.keys(formFields).forEach((key) => {
        form.setFieldsValue({ [key]: formFields?.[key] });
      });
    }
  }, [state]);

  return (
    <div id="main-form-editor">
      <Space direction="vertical" size="large">
        <Row align="middle">
          {/* Form & Question Group */}
          <Col span={24}>
            <Space direction="vertical" size="large">
              <Form
                form={form}
                name="survey-detail"
                onValuesChange={(changedValues, allValues) =>
                  console.log(changedValues, allValues)
                }
                onFinish={(values) => console.log(values)}
                onFinishFailed={({ values, errorFields }) =>
                  console.log(values, errorFields, form.getFieldsValue())
                }
              >
                <FormEditor form={form} />
              </Form>
              {questionGroup?.map((qg, qgi) => (
                <QuestionGroupEditor
                  key={`question-group-key-${qgi + 1}`}
                  index={qgi + 1}
                  questionGroup={qg}
                />
              ))}
            </Space>
          </Col>
        </Row>
        <Row align="middle">
          {/* Button */}
          {/* <Col span={22}>
              <Row align="middle" justify="space-between">
                <Col span={12} align="start" onClick={() => form.submit()}>
                  <Button>Save</Button>
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
            </Col> */}
        </Row>
      </Space>
    </div>
  );
};

export default MainEditor;
