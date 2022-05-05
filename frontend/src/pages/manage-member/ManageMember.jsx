import React, { useState, useEffect } from "react";
import "./styles.scss";

import {
  Button,
  Col,
  Row,
  Typography,
  Table,
  Space,
  Select,
  Input,
} from "antd";
import { RiPencilFill } from "react-icons/ri";

import AddMember from "./AddMember";
import { api, store } from "../../lib";

const { Title } = Typography;

const ManageMember = () => {
  const { isLoggedIn, optionValues } = store.useState((s) => s);
  const { organisation, member_type, isco_type } = optionValues;
  const iscoType = isco_type.filter((isco) => isco.name !== "All");
  const memberNameOptions = organisation.map((org) => {
    return { id: org.id, name: org.name };
  });

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewMemberVisible, setIsNewMemberVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberName, setMemberName] = useState(null);
  const [memberNameFilter, setMemberNameFilter] = useState(null);
  const [memberValue, setMemberValue] = useState(null);
  const [memberTypeFilter, setMemberTypeFilter] = useState(null);
  const [iscoValue, setIscoValue] = useState(null);
  const [iscoFilter, setIscoFilter] = useState(null);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Member Type",
      dataIndex: "member",
      key: "member_type",
    },
    {
      title: "Isco Type",
      dataIndex: "isco",
      key: "isco_type",
    },
    {
      title: "",
      render: (record) => (
        <Space key={`${record?.id}-${record?.key}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
            onClick={() => {
              setIsNewMemberVisible(true);
              setSelectedMember(record);
            }}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, []);

  const handleMemberNameFilter = (val) => {
    setMemberName(val);
    let orgs = organisation;
    orgs = orgs.filter((o) => o.member.includes(val));
    orgs = orgs.length ? orgs : null;
    setMemberNameFilter(orgs);
  };

  const handleMemberFilter = (member) => {
    setMemberValue(member);
    setIscoFilter(null);
    let orgs = organisation;
    orgs = orgs.filter((o) => o.member_type.includes(member));
    orgs = orgs.length ? orgs : null;
    setMemberTypeFilter(orgs);
  };

  const handleIscoFilter = (isco) => {
    setIscoValue(isco);
    setMemberTypeFilter(null);
    let orgs = organisation;
    orgs = orgs.filter((o) => o.isco_type.includes(isco));
    orgs = orgs.length ? orgs : null;
    setIscoFilter(orgs);
  };

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      let url = `/organisation/paginated?page=${page}&page_size=${pageSize}`;
      if (memberName) {
        url = `${url}&name=${memberName}`;
      }
      if (memberValue) {
        url = `${url}&member=${memberValue}`;
      }
      if (iscoValue) {
        url = `${url}&isco=${iscoValue}`;
      }
      api
        .get(url)
        .then((res) => {
          const { data } = res;
          const orgs = data?.data.map((o) => {
            let members = [o.member.join(", ")];
            let iscos = [o.isco.join(", ")];
            return {
              ...o,
              member: members,
              isco: iscos,
            };
          });
          setIsLoading(false);
          setData({
            ...data,
            data: orgs,
          });
        })
        .catch((e) => {
          setIsLoading(false);
          setData([]);
        });
    }
  }, [reload, page, memberNameFilter, memberTypeFilter, iscoFilter]);

  return (
    <div id="manage-member">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
            style={{ borderBottom: "1px solid #777777" }}
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Title className="page-title" level={3}>
                Manage Members
              </Title>
            </Col>
            <Col align="end">
              <Button
                className="button-add"
                type="primary"
                ghost
                onClick={() => {
                  setIsNewMemberVisible(true);
                  setSelectedMember(null);
                }}
              >
                New Member
              </Button>
            </Col>
          </Row>
          <Row
            className="filter-wrapper"
            align="middle"
            justify="space-between"
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Space wrap>
                <Select
                  allowClear
                  showSearch
                  className="member-dropdown-wrapper"
                  placeholder="Member Name"
                  options={
                    memberNameOptions.length
                      ? memberNameOptions.map((o) => ({
                          label: o.name,
                          value: o.id,
                        }))
                      : []
                  }
                  onChange={handleMemberNameFilter}
                  value={memberName}
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
                    iscoType.length
                      ? iscoType.map((o) => ({
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
      <AddMember
        isAddMemberVisible={isNewMemberVisible}
        setIsAddMemberVisible={setIsNewMemberVisible}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default ManageMember;
