import React, { useState, useMemo } from "react";
import { Row, Col, Form, Input, Button, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { api, store } from "../../../lib";
import { passwordCheckBoxOptions } from "../../../lib/util";
import { uiText } from "../../../static";

const SetPassword = ({ url, invalidUrl, notify }) => {
  const [form] = Form.useForm();
  const [checkedList, setCheckedList] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  const { language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const passwordCriteria = useMemo(() => {
    return passwordCheckBoxOptions(text);
  }, [text]);

  const onChange = ({ target }) => {
    const criteria = passwordCriteria
      .map((x) => {
        const available = x.re.test(target.value);
        return available ? x.name : false;
      })
      .filter((x) => x);
    setCheckedList(criteria);
  };

  const onFinish = ({ password }) => {
    setBtnLoading(true);
    const payload = new FormData();
    payload.append("password", password);
    api
      .post(`/user/${url}`, payload)
      .then(() => {
        notify({
          type: "success",
          message: "Your password is successfully updated.",
        });
        navigate("/login");
      })
      .catch(() => {
        notify({
          type: "error",
          message: "Internal Server Error",
        });
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  return [
    <Row
      key="checklist"
      align="middle"
      justify="space-between"
      gutter={[12, 12]}
    >
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
    </Row>,
    <Form
      key="the-form"
      form={form}
      className="form-wrapper"
      onFinish={onFinish}
      onChange={onChange}
    >
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your Password!",
          },
          () => ({
            validator() {
              if (checkedList.length === 4) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("False Password Criteria"));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password
          className="bg-grey"
          placeholder="Password"
          size="large"
          disabled={invalidUrl}
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please Confirm Password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The two passwords that you entered do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password
          className="bg-grey"
          size="large"
          placeholder="Confirm Password"
          disabled={invalidUrl}
        />
      </Form.Item>
      <Button
        type="primary"
        ghost
        block
        size="large"
        onClick={() => form.submit()}
        loading={btnLoading}
        disabled={invalidUrl}
      >
        Set Password
      </Button>
    </Form>,
  ];
};

export default SetPassword;
