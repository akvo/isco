import React, { useEffect, useState } from "react";
import { Form, Space, Row, Col, Tooltip, Button, Popconfirm } from "antd";
import { store, api } from "../../lib";
import { AiOutlineGroup } from "react-icons/ai";
import FormEditor from "./FormEditor";
import QuestionGroup from "./QuestionGroup";
import orderBy from "lodash/orderBy";
import { useNotification } from "../../util";

const CustomWrapper = ({ isNotSpace, children }) => {
  if (isNotSpace) {
    return <div>{children}</div>;
  }
  return (
    <Space direction="vertical" size={18}>
      {children}
    </Space>
  );
};

const MainEditor = () => {
  const [form] = Form.useForm();
  const { surveyEditor, isAddQuestionGroup, isMoveQuestionGroup } =
    store.useState((s) => s);
  const { id: formId, name, description, languages } = surveyEditor;
  const { notify } = useNotification();

  const { questionGroup } = surveyEditor;
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [publishButtonLoading, setPublishButtonLoading] = useState(false);

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

  const handlePublishForm = () => {
    setPublishButtonLoading(true);
    api
      .post(`/form/publish?form_id=${formId}`)
      .then((res) => {
        store.update((s) => {
          s.surveyEditor = {
            ...s.surveyEditor,
            ...res.data,
          };
        });
        notify({
          type: "success",
          message: "Survey published successfully.",
        });
      })
      .catch((e) => {
        console.error(e);
        notify({
          type: "error",
          message: "Error when publishing survey.",
        });
      })
      .finally(() => {
        setPublishButtonLoading(false);
      });
  };

  return (
    <div id="main-form-editor">
      <Space direction="vertical" size="large">
        <Row align="middle">
          {/* Form & Question Group */}
          <Col span={24}>
            {/* Button Add Section */}
            <div className="button-control-wrapper">
              <Tooltip title="Add new section">
                <Button
                  ghost
                  icon={<AiOutlineGroup />}
                  onClick={() =>
                    store.update((s) => {
                      s.isAddQuestionGroup = true;
                    })
                  }
                />
              </Tooltip>
            </div>
            <CustomWrapper
              isNotSpace={isAddQuestionGroup || isMoveQuestionGroup}
            >
              <Row align="middle" className="form-editor-wrapper">
                {/* Button */}
                <Col span={24}>
                  <Row align="start" justify="space-between">
                    <Col span={14} align="start" onClick={() => form.submit()}>
                      <Form
                        form={form}
                        name="survey-detail"
                        onFinish={onSubmitForm}
                      >
                        <Space direction="vertical">
                          <FormEditor
                            form={form}
                            showSaveButton={true}
                            saveButtonLoading={saveButtonLoading}
                          />
                        </Space>
                      </Form>
                    </Col>
                    <Col span={10} align="end">
                      <Popconfirm
                        placement="left"
                        title="This will make all the changes of the survey available to all users."
                        okText="Ok"
                        cancelText="Cancel"
                        onConfirm={() => handlePublishForm()}
                      >
                        <Button
                          className="float-right"
                          type="primary"
                          loading={publishButtonLoading}
                          disabled={publishButtonLoading}
                        >
                          Publish
                        </Button>
                      </Popconfirm>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {orderBy(questionGroup, ["order"])?.map((qg, qgi) => (
                <QuestionGroup
                  key={`question-group-key-${qgi}`}
                  index={qgi}
                  questionGroup={qg}
                />
              ))}
            </CustomWrapper>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default MainEditor;
