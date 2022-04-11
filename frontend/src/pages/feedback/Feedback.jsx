import React, { useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Card, Form, Input, Select, Space, Button } from "antd";

const Feedback = () => {
  const [form] = Form.useForm();
  const [reloadCaptcha, setReloadCaptcha] = useState(true);
  const [captchaValue, setCaptchaValue] = useState(0);

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

  return (
    <div id="feedback" className="container">
      <Row align="middle" justify="center">
        <Col span={16}>
          <Card title="Please provide your feedback. It is highly valuable to improve the system.">
            <Form
              form={form}
              name="feedback-form"
              layout="vertical"
              onFinish={(values) => console.info(values)}
              onFinishFailed={(values, errorFields) =>
                console.error(values, errorFields)
              }
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
                  <Select className="bg-grey" options={[]} />
                </Form.Item>
                {/* TextArea */}
                <Form.Item
                  label="Feedback"
                  name="text"
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
