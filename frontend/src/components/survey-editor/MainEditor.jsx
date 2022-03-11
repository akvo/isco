import React from "react";
import { Form } from "antd";
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
        <FormEditor form={form} />
        <QuestionGroupEditor form={form} />
      </Form>
    </div>
  );
};

export default MainEditor;
