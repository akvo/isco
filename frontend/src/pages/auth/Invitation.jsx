import React, { useState, useEffect } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button, Checkbox } from "antd";
import Auth from "./Auth";
import { api } from "../../lib";
import { useParams } from "react-router-dom";
import { useNotification } from "../../util";
import { passwordCheckBoxOptions } from "../../lib/util";

const Invitation = () => {
  const [form] = Form.useForm();
  const { invitationId } = useParams();
  const [guess, setGuess] = useState({
    name: "",
    id: 0,
    invitation: "",
    email: "",
  });
  const [checkedList, setCheckedList] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorInvitation, setErrorInvitation] = useState(false);
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/user/invitation/${invitationId}`)
      .then((res) => {
        setErrorInvitation(false);
        api.setToken(null);
        setGuess(res.data);
      })
      .catch(() => {
        api.setToken(null);
        setErrorInvitation(true);
        notify({
          type: "error",
          message: "Invitation ID not found",
        });
      });
  }, [invitationId, notify]);

  const onChange = ({ target }) => {
    const criteria = passwordCheckBoxOptions
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
      .post(`/user/invitation/${invitationId}`, payload)
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

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={24} align="start">
            <h2>
              {errorInvitation ? "Wrong Invitation ID" : "Welcome "}
              <b>{guess.name.length ? `${guess.name} (${guess.email})` : ""}</b>
            </h2>
          </Col>
        </Row>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={24} align="start">
            <Checkbox.Group
              className="checkbox-criteria"
              options={passwordCheckBoxOptions.map((x) => x.name)}
              value={checkedList}
            />
          </Col>
        </Row>
        <Form
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
              disabled={errorInvitation}
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
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              className="bg-grey"
              size="large"
              placeholder="Confirm Password"
              disabled={errorInvitation}
            />
          </Form.Item>
          <Button
            type="primary"
            ghost
            block
            size="large"
            onClick={() => form.submit()}
            loading={btnLoading}
            disabled={errorInvitation}
          >
            Set Password
          </Button>
        </Form>
      </Space>
    </Auth>
  );
};

export default Invitation;
