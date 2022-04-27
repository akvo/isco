import React, { useMemo, useState } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Space,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  InputNumber,
  Alert,
} from "antd";
import Auth from "./Auth";
import { store, api } from "../../lib";
import { uiText, webformContent } from "../../static";
import { passwordCheckBoxOptions } from "../../lib/util";
import { intersection, sortBy } from "lodash";
import { useNotification } from "../../util";

const Register = () => {
  const [form] = Form.useForm();
  const { optionValues, language } = store.useState((s) => s);
  const { active: activeLang } = language;
  const { isco_type, organisation } = optionValues;
  const [checkedList, setCheckedList] = useState([]);
  const [iscoFilter, setIscoFilter] = useState(null);
  const [sending, setSending] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [registerComplete, setRegisterComplete] = useState(false);
  const { notify } = useNotification();

  const iscoOption = useMemo(() => {
    return isco_type?.map((i) => ({
      label: i?.name,
      value: i?.id,
    }));
  }, [isco_type]);

  const organisationOption = useMemo(() => {
    const orgs = organisation
      ?.filter((o) => {
        // show All
        if (!iscoFilter || iscoFilter === 1) {
          return true;
        }
        return intersection(o.isco_type, [iscoFilter]).length;
      })
      ?.map((o) => {
        return {
          label: o?.name,
          value: o?.id,
        };
      });
    return sortBy(orgs, ["label"]);
  }, [organisation, iscoFilter]);

  const handleOnClickDataSecurity = () => {
    store.update((s) => {
      s.notificationModal = {
        ...s.notificationModal,
        dataSecurity: {
          ...s.notificationModal.dataSecurity,
          visible: true,
        },
      };
    });
  };

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const content = useMemo(() => {
    return webformContent(handleOnClickDataSecurity)[activeLang];
  }, [activeLang]);

  const onChange = ({ target }) => {
    if (target.id === "password") {
      const criteria = passwordCheckBoxOptions
        .map((x) => {
          const available = x.re.test(target.value);
          return available ? x.name : false;
        })
        .filter((x) => x);
      setCheckedList(criteria);
    }
  };

  const handleRegisterOnFinish = (values) => {
    setSending(true);
    const { fullname, email, phone_number, password, organisation } = values;
    const payload = new FormData();
    payload.append("name", fullname);
    payload.append("email", email);
    payload.append("phone_number", phone_number || null);
    payload.append("password", password);
    payload.append("organisation", organisation);

    api
      .post("/user/register", payload)
      .then(() => {
        setSending(false);
        form.resetFields();
        setRegisterComplete(true);
      })
      .catch(() => {
        setSending(false);
        notify({
          type: "error",
          message: text.textAlertSomethingWentWrong,
        });
      });
  };

  if (registerComplete) {
    return (
      <Auth>
        <Alert
          message={text.valRegisterSuccess}
          description={text.valVerificationInfo}
          type="success"
          showIcon
        />
      </Auth>
    );
  }

  return (
    <Auth>
      <Space direction="vertical" style={{ marginBottom: "12vh" }}>
        <Row align="bottom" justify="space-between" gutter={[12, 12]}>
          <Col span={8} align="start">
            <h2>{text.formRegister}</h2>
          </Col>
          <Col span={16} align="end">
            <p className="float-right">
              {text.formHaveAccount} <Link to="/login">{text.btnLogin}</Link>
            </p>
          </Col>
        </Row>
        <p className="data-security-provisions-doc-info">
          {text.infoDataSecurityDoc}
        </p>
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
          onChange={onChange}
          onFinish={handleRegisterOnFinish}
          scrollToFirstError
        >
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: text.valFullName }]}
          >
            <Input
              className="bg-grey"
              placeholder={text.formFullName}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: text.valEmail }]}
          >
            <Input
              className="bg-grey"
              placeholder={text.formEmail}
              size="large"
            />
          </Form.Item>
          <Form.Item name="phone_number">
            <InputNumber
              controls={false}
              className="bg-grey"
              placeholder={text.formPhoneNumber}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: text.valPwd,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    checkedList.length === 4 &&
                    getFieldValue("old_password") !== value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("False Password Criteria"));
                },
              }),
            ]}
          >
            <Input.Password
              className="bg-grey"
              placeholder={text.formPwd}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            dependencies={["password"]}
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
          <Form.Item>
            <Select
              allowClear
              size="large"
              className="bg-grey"
              placeholder={text.registerFilterOrganizationsBy}
              options={iscoOption}
              onChange={(val) => setIscoFilter(val)}
              getPopupContainer={(trigger) => trigger.parentNode}
            />
          </Form.Item>
          <Form.Item
            name="organisation"
            rules={[
              {
                required: true,
                message: text.valOrganization,
              },
            ]}
          >
            <Select
              showSearch
              className="bg-grey"
              size="large"
              placeholder={text.tbColOrganization}
              options={organisationOption}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              getPopupContainer={(trigger) => trigger.parentNode}
            />
          </Form.Item>
          <Form.Item name="agreement">
            <Space align="start">
              <Checkbox onChange={() => setAgreement(!agreement)} />{" "}
              <div>{content.registerCheckBoxText}</div>
            </Space>
          </Form.Item>
          <Button
            type="primary"
            ghost
            block
            onClick={() => form.submit()}
            size="large"
            loading={sending}
            disabled={!agreement}
          >
            {text.formRegister}
          </Button>
        </Form>
      </Space>
    </Auth>
  );
};

export default Register;
