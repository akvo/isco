import React, { useState, useEffect } from "react";
import "./style.scss";
import {
  Row,
  Col,
  Table,
  Button,
  Space,
  Input,
  Select,
  Checkbox,
  Typography,
  Tooltip,
  Tag,
  Popconfirm,
} from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { RiPencilFill, RiDeleteBinFill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import AddUser from "./AddUser";
import { store, api } from "../../lib";
import capitalize from "lodash/capitalize";
import moment from "moment";
import { useNotification } from "../../util";

const { Title } = Typography;

const InvitationCopy = ({ invitation }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip
      placement="top"
      title={
        copied ? (
          <Space>
            <CheckCircleOutlined twoToneColor="#52c41a" />
            Copied
          </Space>
        ) : (
          "Copy invitation link to Clipboard"
        )
      }
    >
      <Tag
        style={{ cursor: "pointer" }}
        icon={<ClockCircleOutlined />}
        onClick={(e) => {
          e.preventDefault();
          navigator.clipboard.writeText(
            `${window.location.origin}/invitation/${invitation}`
          );
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        }}
      >
        Pending set password
      </Tag>
    </Tooltip>
  );
};

const ManageUser = () => {
  const { isLoggedIn, user, optionValues } = store.useState((s) => s);
  const {
    organisationInSameIsco: organisation,
    member_type,
    isco_type,
  } = optionValues;
  const { notify } = useNotification();

  const [showPendingUser, setShowPendingUser] = useState(false);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState([]);

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(null);
  const [orgFilter, setOrgFilter] = useState(null);
  const [memberFilter, setMemberFilter] = useState(null);
  const [iscoFilter, setIscoFilter] = useState(null);
  const [organisationValue, setOrganisationValue] = useState([]);
  const [memberValue, setMemberValue] = useState([]);
  const [iscoValue, setIscoValue] = useState([]);
  const [publishedForm, setPublishedForm] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const showAddNewUser = true;
  const showOrganisationFilter = user?.role === "secretariat_admin";

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
      render: (value, data) => {
        return value ? (
          moment(value).format("MMMM Do YYYY, h:mm a")
        ) : !showPendingUser ? (
          <InvitationCopy {...data} />
        ) : (
          <Tag icon={<ClockCircleOutlined />}>Email not verified</Tag>
        );
      },
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
    {
      title: "Action",
      render: (record) => (
        <Space key={`${record?.id}-${record?.key}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
            onClick={() => {
              setIsAddUserVisible(true);
              setSelectedUser(record);
            }}
          />
          <Popconfirm
            title="Delete user can't be undone."
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDeleteButton(record)}
          >
            <Button
              className="action-btn"
              icon={<RiDeleteBinFill />}
              shape="circle"
              type="text"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [showPendingUser]);

  useEffect(() => {
    // get form
    api
      .get("/form/published")
      .then((res) => {
        setPublishedForm(res.data);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  useEffect(() => {
    if (isLoggedIn && organisation.length) {
      setIsLoading(true);
      setSelectedUser(null);
      let url = `/user?page=${page}&limit=${pageSize}`;
      if (search) {
        url = `${url}&search=${search}`;
      }
      if (orgFilter) {
        url = `${url}&organisation=${orgFilter}`;
      }
      if (memberFilter && !orgFilter) {
        url = `${url}${memberFilter.map((x) => `&organisation=${x}`).join("")}`;
      }
      if (iscoFilter && !orgFilter) {
        url = `${url}${iscoFilter.map((x) => `&organisation=${x}`).join("")}`;
      }
      if (showPendingUser) {
        url = `${url}&approved=0`;
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
  }, [
    isLoggedIn,
    page,
    search,
    organisation,
    orgFilter,
    memberFilter,
    iscoFilter,
    reload,
    showPendingUser,
  ]);

  const handleShowPendingUsers = () => {
    setShowPendingUser(!showPendingUser);
  };

  const handleOrganisationFilter = (org) => {
    setOrganisationValue(org);
    setMemberValue([]);
    setIscoValue([]);
    setOrgFilter(org);
    setMemberFilter(null);
    setIscoFilter(null);
  };

  const handleMemberFilter = (member) => {
    setMemberValue(member);
    setOrganisationValue([]);
    setOrgFilter(null);
    let orgIds = organisation;
    if (iscoFilter) {
      orgIds = orgIds.filter((o) => iscoFilter.includes(o.id));
    }
    if (member === 1) {
      // for All vallue
      orgIds = orgIds.map((o) => o.id);
    } else {
      orgIds = orgIds.filter((o) => o.member_type === member).map((o) => o.id);
    }
    orgIds = orgIds.length ? orgIds : null;
    setMemberFilter(orgIds);
  };

  const handleIscoFilter = (isco) => {
    setIscoValue(isco);
    setOrganisationValue([]);
    setOrgFilter(null);
    let orgIds = organisation;
    if (memberFilter) {
      orgIds = orgIds.filter((o) => memberFilter.includes(o.id));
    }
    if (isco === 1) {
      // for All vallue
      orgIds = orgIds.map((o) => o.id);
    } else {
      orgIds = orgIds
        .filter((o) => o.isco_type.includes(isco))
        .map((o) => o.id);
    }
    orgIds = orgIds.length ? orgIds : null;
    setIscoFilter(orgIds);
  };

  const handleDeleteButton = (record) => {
    const { id, email } = record;
    api
      .delete(`/user/${id}`)
      .then(() => {
        setReload(reload + 1);
        notify({
          type: "success",
          message: `User ${email} deleted successfully.`,
        });
      })
      .catch((e) => {
        console.error(e);
        const { status } = e.response;
        if (status === 404) {
          notify({
            type: "error",
            message: `Can't delete user ${email}, because user have submission.`,
          });
        } else {
          notify({
            type: "error",
            message: "Oops, something went wrong.",
          });
        }
      });
  };

  return (
    <div id="manage-user">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Title className="page-title" level={3}>
                Manage Users
              </Title>
            </Col>
            {showAddNewUser && (
              <Col align="end">
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
            )}
          </Row>
          <Row
            className="filter-wrapper"
            align="middle"
            justify="space-between"
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Space wrap>
                <Input
                  className="input-search"
                  placeholder="Search user by name or email"
                  prefix={<FaSearch />}
                  onChange={(val) => setSearch(val.target.value)}
                />
                {showOrganisationFilter && (
                  <>
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
                      onChange={handleOrganisationFilter}
                      value={organisationValue}
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .indexOf(input?.toLowerCase()) >= 0
                      }
                    />
                    <Select
                      allowClear
                      showSearch
                      className="member-dropdown-wrapper"
                      placeholder="Member Type"
                      options={
                        member_type.length
                          ? member_type.map((o) => ({
                              label: o.name,
                              value: o.id,
                            }))
                          : []
                      }
                      onChange={handleMemberFilter}
                      value={memberValue}
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .indexOf(input?.toLowerCase()) >= 0
                      }
                    />
                    <Select
                      allowClear
                      showSearch
                      className="member-dropdown-wrapper"
                      placeholder="ISCO"
                      options={
                        isco_type.length
                          ? isco_type.map((o) => ({
                              label: o.name,
                              value: o.id,
                            }))
                          : []
                      }
                      onChange={handleIscoFilter}
                      value={iscoValue}
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .indexOf(input?.toLowerCase()) >= 0
                      }
                    />
                  </>
                )}
              </Space>
            </Col>
            {/* Show Pending User */}
            <Col align="end">
              <Space align="center">
                <span>Pending Users</span>
                <Checkbox
                  value={showPendingUser}
                  onChange={handleShowPendingUsers}
                />
              </Space>
            </Col>
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
      <AddUser
        publishedForm={publishedForm}
        isAddUserVisible={isAddUserVisible}
        setIsAddUserVisible={setIsAddUserVisible}
        setReload={setReload}
        reload={reload}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
    </div>
  );
};

export default ManageUser;
