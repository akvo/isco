import React from "react";
import { Form, Space, Row, Col, Button } from "antd";
import FormEditor from "./FormEditor";
import QuestionGroupEditor from "./QuestionGroupEditor";

const MainEditor = () => {
  const [form] = Form.useForm();

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
                <QuestionGroupEditor form={form} />
              </Space>
            </Col>
          </Row>
          <Row align="middle">
            {/* Button */}
            <Col span={21}>
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
