import React, { useMemo, useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Card, Form, Input, Button, Checkbox, Divider } from "antd";
import { store } from "../../lib";
import { uiText } from "../../static";
import { passwordCheckBoxOptions } from "../../lib/util";

const Setting = () => {
  const [form] = Form.useForm();
  const { user, language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const [btnLoading, setBtnLoading] = useState(false);
  const [checkedList, setCheckedList] = useState([]);

  useEffect(() => {
    if (user?.email) {
      form.setFieldsValue({ email: user.email });
    }
  }, [form, user]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const onChange = ({ target }) => {
    if (target.id === "new_password") {
      const criteria = passwordCheckBoxOptions
        .map((x) => {
          const available = x.re.test(target.value);
          return available ? x.name : false;
        })
        .filter((x) => x);
      setCheckedList(criteria);
    }
  };

  const onFinish = (values) => {
    console.info(values);
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
    }, 1000);
  };

  return (
    <div id="setting" className="container">
      <Row justify="center">
        <Col span={18}>
          <Card title={text.formChangePwd}>
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col span={24} align="start">
                <Checkbox.Group
                  className="checkbox-criteria"
                  options={passwordCheckBoxOptions.map((x) => x.name)}
                  value={checkedList}
                />
              </Col>
            </Row>
            <Divider />
            <Form
              form={form}
              className="form-wrapper"
              layout="vertical"
              onChange={onChange}
              onFinish={onFinish}
            >
              <Form.Item
                label={text.formEmail}
                name="email"
                rules={[{ required: true, message: text.valEmail }]}
              >
                <Input
                  className="bg-grey"
                  type="email"
                  disabled={true}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label={text.formOldPwd}
                name="password"
                rules={[
                  {
                    required: true,
                    message: text.valOldPwd,
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  className="bg-grey"
                  placeholder={text.formOldPwd}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label={text.formPwd}
                name="new_password"
                rules={[
                  {
                    required: true,
                    message: text.valPwd,
                  },
                  () => ({
                    validator() {
                      if (checkedList.length === 4) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("False Password Criteria")
                      );
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  className="bg-grey"
                  placeholder={text.formPwd}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label={text.formConfirmPwd}
                name="confirm_password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please Confirm Password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(text.valPwdNotMatch));
                    },
                  }),
                ]}
              >
                <Input.Password
                  className="bg-grey"
                  size="large"
                  placeholder={text.formConfirmPwd}
                />
              </Form.Item>
              <Button
                type="primary"
                ghost
                block
                size="large"
                onClick={() => form.submit()}
                loading={btnLoading}
              >
                {text.btnUpdate}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Setting;
