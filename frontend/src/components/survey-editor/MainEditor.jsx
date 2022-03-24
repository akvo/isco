import React, { useEffect, useState } from "react";
import { Form, Space, Row, Col } from "antd";
import { store, api } from "../../lib";
import FormEditor from "./FormEditor";
import QuestionGroupEditor from "./QuestionGroupEditor";
import orderBy from "lodash/orderBy";

const MainEditor = () => {
  const [form] = Form.useForm();
  const surveyEditor = store.useState((s) => s?.surveyEditor);
  const { id: formId, name, description, languages } = surveyEditor;

  const { questionGroup } = surveyEditor;
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);

  useEffect(() => {
    if (formId) {
      const formFields = {
        "form-name": name,
        "form-description": description,
        "form-languages": languages,
      };
      // set form fields initial value
      Object.keys(formFields).forEach((key) => {
        form.setFieldsValue({ [key]: formFields?.[key] });
      });
    }
  }, [name, description, languages, formId, form]);

  const onSubmitForm = (values) => {
    setSaveButtonLoading(true);
    let data = {};
    Object.keys(values)?.forEach((key) => {
      const field = key.split("-")[1];
      data = {
        ...data,
        ...{ [field]: values[key] },
      };
    });
    api
      .put(`/form/${formId}`, data, { "content-type": "application/json" })
      .then((res) => {
        const { data } = res;
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            ...data,
          };
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      })
      .finally(() => {
        setSaveButtonLoading(false);
      });
  };

  return (
    <div id="main-form-editor">
      <Space direction="vertical" size="large">
        <Row align="middle">
          {/* Form & Question Group */}
          <Col span={24}>
            <Space direction="vertical" size="large">
              <Form form={form} name="survey-detail" onFinish={onSubmitForm}>
                <Space direction="vertical">
                  <FormEditor
                    form={form}
                    showSaveButton={true}
                    saveButtonLoading={saveButtonLoading}
                  />
                </Space>
              </Form>
              {orderBy(questionGroup, ["order"])?.map((qg, qgi) => (
                <QuestionGroupEditor
                  key={`question-group-key-${qgi}`}
                  index={qgi}
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
