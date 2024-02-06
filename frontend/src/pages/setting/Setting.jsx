import React, { useMemo, useEffect, useState } from "react";
import "./style.scss";
import { Row, Col, Card, Form, Input, Button, Checkbox, Divider } from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";
import { passwordCheckBoxOptions } from "../../lib/util";
import { useNotification } from "../../util";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Setting = () => {
  const [form] = Form.useForm();
  const { user, language } = store.useState((s) => s);
  const { active: activeLang } = language;
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);

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

  const passwordCriteria = useMemo(() => {
    return passwordCheckBoxOptions(text);
  }, [text]);

  const onChange = ({ target }) => {
    if (target.id === "new_password") {
      const criteria = passwordCriteria
        .map((x) => {
          const available = x.re.test(target.value);
          return available ? x.name : false;
        })
        .filter((x) => x);
      setCheckedList(criteria);
    }
  };

  const onFinish = ({ old_password, new_password }) => {
    setBtnLoading(true);
    const payload = new FormData();
    payload.append("old_password", old_password);
    payload.append("new_password", new_password);
    api
      .put("/user/update_password", payload)
      .then(() => {
        notify({
          type: "success",
          message: "Your password successfully updated. Please login again.",
        });
        if (cookies?.AUTH_TOKEN) {
          removeCookie("AUTH_TOKEN");
          removeCookie("REFRESH_TOKEN");
          api.setToken(null);
          store.update((s) => {
            s.isLoggedIn = false;
            s.user = null;
          });
          navigate("/login");
        }
      })
      .catch((e) => {
        const { status } = e.response;
        if (status === 404) {
          notify({
            type: "error",
            message: "Your old password doesn't match. Please try again.",
          });
        } else {
          notify({
            type: "error",
            message: "Something went wrong.",
          });
        }
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  return (
    <div id="setting" className="container">
      <Row justify="center">
        <Col span={18}>
          <Card title={text.formChangePwd}>
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col span={24} align="start">
                <p>
                  <u>{text.passwordCriteriaInfoText}</u>
                </p>
                <Checkbox.Group
                  className="checkbox-criteria"
                  options={passwordCriteria.map((x) => x.name)}
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
                <Input type="email" disabled={true} size="large" />
              </Form.Item>
              <Form.Item
                label={text.formOldPwd}
                name="old_password"
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
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        checkedList.length === 4 &&
                        getFieldValue("old_password") === value
                      ) {
                        return Promise.reject(
                          new Error(
                            "New password can't be same as your old password"
                          )
                        );
                      }
                      if (
                        checkedList.length === 4 &&
                        getFieldValue("old_password") !== value
                      ) {
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
