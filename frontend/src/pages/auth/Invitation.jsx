import React, { useState, useEffect } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Form, Input, Button, Checkbox } from "antd";
import Auth from "./Auth";
import { api } from "../../lib";
import { useParams } from "react-router-dom";
import { useNotification } from "../../util";

const checkBoxOptions = [
  { name: "Lowercase Character", re: /[a-z]/ },
  { name: "Numbers", re: /\d/ },
  { name: "Special Character", re: /[-._!"`'#%&,:;<>=@{}~$()*+/?[\]^|]/ },
  { name: "Min 8 Character", re: /[^ ]{8}/ },
];

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
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/user/invitation/${invitationId}`).then((res) => {
      api.setToken(null);
      setGuess(res.data);
    });
  }, [invitationId]);

  const onChange = ({ target }) => {
    const criteria = checkBoxOptions
      .map((x) => {
        const available = x.re.test(target.value);
        return available ? x.name : false;
      })
      .filter((x) => x);
    setCheckedList(criteria);
  };

  const onFinish = ({ password }) => {
    setBtnLoading(true);
    api
      .post(`/user/invitation/${invitationId}?password=${password}`)
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
              Welcome{" "}
              <b>{guess.name.length ? `${guess.name} (${guess.email})` : ""}</b>
            </h2>
          </Col>
        </Row>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={24} align="start">
            <Checkbox.Group
              className="checkbox-criteria"
              options={checkBoxOptions.map((x) => x.name)}
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
            Set Password
          </Button>
        </Form>
      </Space>
    </Auth>
  );
};

export default Invitation;
