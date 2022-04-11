import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Card, Form, Input, Select, Space, Button } from "antd";
import { api } from "../../lib";
import { useNotification } from "../../util";

const categories = ["Questionnaire", "Tool", "Other"];

const Feedback = () => {
  const [form] = Form.useForm();
  const { notify } = useNotification();
  const [reloadCaptcha, setReloadCaptcha] = useState(true);
  const [captchaValue, setCaptchaValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reloadCaptcha) {
      const captchaNumber = document.getElementById("captcha-number");
      if (captchaNumber && captchaNumber.childNodes[0]) {
        captchaNumber.removeChild(captchaNumber.childNodes[0]);
      }
      if (captchaNumber) {
        const validatorX = Math.floor(Math.random() * 9) + 1;
        const validatorY = Math.floor(Math.random() * 9) + 1;
        const canv = document.createElement("canvas");
        canv.width = 100;
        canv.height = 50;
        const ctx = canv.getContext("2d");
        ctx.font = "35px Assistant, sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText(validatorX + "+" + validatorY, 50, 35);
        setCaptchaValue(validatorX + validatorY);
        captchaNumber.appendChild(canv);
      }
      setReloadCaptcha(false);
    }
  }, [reloadCaptcha]);

  const handleOnFormFinish = ({ title, category, content }) => {
    setSubmitting(true);
    const payload = {
      title: title,
      category: category,
      content: content,
    };
    api
      .post("/feedback", payload)
      .then(() => {
        form.resetFields();
        notify({
          type: "success",
          message: "Your feedback has been sent successfully.",
        });
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Oops, something went wrong.",
        });
      })
      .finally(() => {
        setReloadCaptcha(true);
        setSubmitting(false);
      });
  };

  return (
    <div id="feedback" className="container">
      <Row align="middle" justify="center">
        <Col span={16}>
          <Card title="Please provide your feedback. It is highly valuable to improve the system.">
            <Form
              form={form}
              name="feedback-form"
              layout="vertical"
              onFinish={handleOnFormFinish}
              scrollToFirstError={true}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {/* Title */}
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: "Please input title" }]}
                >
                  <Input className="bg-grey" />
                </Form.Item>
                {/* Category */}
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please select category" },
                  ]}
                >
                  <Select
                    className="bg-grey"
                    options={categories.map((x) => ({
                      label: x,
                      value: x.toLowerCase(),
                    }))}
                  />
                </Form.Item>
                {/* TextArea */}
                <Form.Item
                  label="Feedback"
                  name="content"
                  rules={[
                    { required: true, message: "Please input your feedback" },
                  ]}
                >
                  <Input.TextArea className="bg-grey" rows={5} />
                </Form.Item>
                {/* Captcha */}
                <Space size="large">
                  <div id="captcha-number">Captcha</div>
                  <Form.Item
                    label="Captcha"
                    name="captcha"
                    rules={[
                      { required: true, message: "Captcha required" },
                      () => ({
                        validator(_, value) {
                          if (
                            !value ||
                            Number(value) === Number(captchaValue)
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Wrong Captcha value!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input className="bg-grey" />
                  </Form.Item>
                </Space>
                <Button
                  type="primary"
                  ghost
                  block
                  loading={submitting}
                  onClick={() => form.submit()}
                >
                  Submit
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Feedback;
