import React, { useState, useEffect } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
} from "antd";
import { FaSearch } from "react-icons/fa";
import { store, api } from "../../lib";
import capitalize from "lodash/capitalize";
import moment from "moment";

const { Title } = Typography;

const columns = [
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
    title: "Organization",
    dataIndex: "organisation_name",
    key: "organisation_name",
  },
  {
    title: "Verified on",
    dataIndex: "email_verified",
    key: "email_verified",
    render: (value) => moment(value).format("MMMM Do YYYY, h:mm a"),
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (value) =>
      value
        .split("_")
        .map((x) => capitalize(x))
        .join(" "),
  },
];

const ManageUser = () => {
  const { isLoggedIn, user, optionValues } = store.useState((s) => s);
  const { organisation } = optionValues;

  const [form] = Form.useForm();
  const [isPendingUserShown, setIsPendingUserShown] = useState(false);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(null);
  const [orgFilter, setOrgFilter] = useState(null);

  const showPendingUserOption = false;
  const showOrganisationFilter = user?.role === "secretariat_admin";

  useEffect(() => {
    if (isLoggedIn && organisation.length) {
      setIsLoading(true);
      let url = `/user?page=${page}&limit=${pageSize}`;
      if (search) {
        url = `${url}&search=${search}`;
      }
      if (orgFilter) {
        url = `${url}&organisation=${orgFilter}`;
      }
      api
        .get(url)
        .then((res) => {
          const data = res?.data?.data?.map((d) => {
            const findOrganisation = organisation.find(
              (o) => o.id === d.organisation
            );
            return {
              ...d,
              organisation_name: findOrganisation?.name,
            };
          });
          setData({
            ...res?.data,
            data: data,
          });
        })
        .catch((e) => {
          console.error(e);
          setData([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isLoggedIn, page, search, organisation, orgFilter]);

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
                  onChange={(val) => setSearch(val.target.value)}
                />
                {showOrganisationFilter && (
                  <Select
                    allowClear
                    showSearch
                    className="organisation-dropdown-wrapper"
                    placeholder="Organization"
                    options={
                      organisation.length
                        ? organisation.map((o) => ({
                            label: o.name,
                            value: o.id,
                          }))
                        : []
                    }
                    onChange={(val) => setOrgFilter(val)}
                  />
                )}
              </Space>
            </Col>
            {showPendingUserOption && (
              <Col span={4} align="end">
                <Space size={0.05} align="center">
                  <Button
                    type="text"
                    onClick={() => setIsPendingUserShown(!isPendingUserShown)}
                  >
                    Show Pending Users
                  </Button>{" "}
                  <Checkbox checked={isPendingUserShown} />
                </Space>
              </Col>
            )}
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record) => `${record?.key}-${record?.id}`}
                className="table-wrapper"
                columns={columns}
                dataSource={data?.data || []}
                loading={isLoading}
                pagination={{
                  current: data?.current,
                  pageSize: pageSize,
                  total: data?.total,
                  onChange: (val) => {
                    setPage(val);
                  },
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
