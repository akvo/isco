import React from "react";
import { Form, Space } from "antd";
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
        onFinishFailed={(values, errorFields) =>
          console.log(values, errorFields)
        }
      >
        <Space direction="vertical" size="large">
          <FormEditor form={form} />
          <QuestionGroupEditor form={form} />
        </Space>
      </Form>
    </div>
  );
};

export default MainEditor;
