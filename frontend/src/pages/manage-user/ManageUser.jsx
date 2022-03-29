import React, { useState } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Tooltip,
  Space,
  Modal,
  Form,
  Input,
  Select,
  // Checkbox,
} from "antd";
import { FaSearch, FaInfoCircle } from "react-icons/fa";
import { dataSources } from "./static";

const { Title } = Typography;

const columns = [
  {
    title: "",
    dataIndex: "",
    key: "status",
    render: (record) => {
      if (!record?.info) {
        return "";
      }
      return (
        <Tooltip
          key={`${record?.id}-${record?.key}`}
          title={record?.info}
          placement="left"
        >
          <FaInfoCircle />
        </Tooltip>
      );
    },
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Verified on",
    dataIndex: "email_verified",
    key: "email_verified",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  // {
  //   title: "Surveys",
  //   dataIndex: "access",
  //   key: "access",
  // },
];

const ManageUser = () => {
  const [form] = Form.useForm();
  // const [isPendingUserShown, setIsPendingUserShown] = useState(false);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);

  return (
    <div id="manage-user">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={12} align="start">
              <Title className="page-title" level={3}>
                Manage Users
              </Title>
            </Col>
            <Col span={12} align="end">
              <Button
                className="button-add"
                type="primary"
                ghost
                onClick={() => {
                  setIsAddUserVisible(true);
                }}
              >
                New User
              </Button>
            </Col>
          </Row>
          <Row
            className="filter-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={20} align="start">
              <Space>
                <Input
                  className="input-search"
                  placeholder="Search user by name or email"
                  prefix={<FaSearch />}
                />
                <Select
                  className="organisation-dropdown-wrapper"
                  placeholder="Organization"
                  options={[]}
                />
                {/* <Select
                  className="member-dropdown-wrapper"
                  placeholder="Member Type"
                  options={[]}
                /> */}
              </Space>
            </Col>
            {/* <Col span={4} align="end">
              <Space size={0.05} align="center">
                <Button
                  type="text"
                  onClick={() => setIsPendingUserShown(!isPendingUserShown)}
                >
                  Show Pending Users
                </Button>{" "}
                <Checkbox checked={isPendingUserShown} />
              </Space>
            </Col> */}
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record) => `${record?.key}-${record?.id}`}
                className="table-wrapper"
                columns={columns}
                dataSource={dataSources}
                expandable={{
                  expandedRowRender: (record) => (
                    <p
                      key={`${record.id}-description`}
                      className="expanded-description"
                    >
                      {record.description}
                    </p>
                  ),
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* New User Modal */}
      <Modal
        forceRender={true}
        title={<Title level={4}>Account Details</Title>}
        visible={isAddUserVisible}
        footer={
          <Space>
            <Button onClick={() => setIsAddUserVisible(false)}>Cancel</Button>
            <Button type="primary" ghost onClick={() => form.submit()}>
              Add User
            </Button>
          </Space>
        }
        onCancel={() => setIsAddUserVisible(false)}
      >
        <Form
          form={form}
          name="account-detail"
          onFinish={(values) => console.info(values)}
          onFinishFailed={(values, errorFields) =>
            console.info(values, errorFields)
          }
        >
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Form.Item
                name="firstname"
                rules={[{ required: true, message: "Please input first name" }]}
              >
                <Input className="bg-grey" placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                rules={[{ required: true, message: "Please input last name" }]}
              >
                <Input className="bg-grey" placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={22}>
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Please input email" }]}
              >
                <Input className="bg-grey" placeholder="Email address" />
              </Form.Item>
            </Col>
          </Row>

          <Space size={12}>
            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Role"
                options={[]}
              />
            </Form.Item>
            <Form.Item
              name="organisation"
              rules={[
                { required: true, message: "Please select organization" },
              ]}
            >
              <Select
                className="custom-dropdown-wrapper bg-grey"
                placeholder="Organization"
                options={[]}
              />
            </Form.Item>
          </Space>

          <Form.Item name="access">
            <Select
              className="custom-dropdown-wrapper bg-grey"
              placeholder="Questionnaires"
              options={[]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUser;
