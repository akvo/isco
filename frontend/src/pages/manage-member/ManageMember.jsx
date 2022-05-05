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
import { FaSearch } from "react-icons/fa";

const { Title } = Typography;

const ManageMember = () => {
  const { isLoggedIn, optionValues } = store.useState((s) => s);
  const { organisation, member_type, isco_type } = optionValues;
  const iscoType = isco_type.filter((isco) => isco.name !== "All");

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState(null);
  const [isNewMemberVisible, setIsNewMemberVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberValue, setMemberValue] = useState(null);
  const [memberNameFilter, setMemberNameFilter] = useState(null);
  const [memberTypeFilter, setMemberTypeFilter] = useState(null);
  const [iscoValue, setIscoValue] = useState(null);
  const [iscoFilter, setIscoFilter] = useState(null);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState([]);

  const pageSize = 10;
  const [page, setPage] = useState(1);

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

  const handleSearchMemberByName = (value) => {
    setSearch(value.target.value);
    setMemberTypeFilter(null);
    setIscoFilter(null);
    const filteredByMemberName = data.filter((m, i) => {
      return m.name.toLowerCase().includes(value.target.value.toLowerCase());
    });
    setMemberNameFilter(filteredByMemberName);
  };

  const handleMemberFilter = (member) => {
    setMemberValue(member);
    setIscoFilter(null);
    const filteredByMemberType = data.filter((m, i) => {
      return m.member_type.includes(member);
    });
    setMemberTypeFilter(filteredByMemberType);
  };

  const handleIscoFilter = (isco) => {
    setIscoValue(isco);
    setMemberTypeFilter(null);
    const filteredByIscoType = data.filter((m, i) => {
      return m.isco_type.includes(isco);
    });
    setIscoFilter(filteredByIscoType);
  };

  useEffect(() => {
    if (isLoggedIn) {
      let url = `/user?page=${page}&limit=${pageSize}`;
      if (search) {
        url = `${url}&search=${search}`;
      }
      if (memberTypeFilter && !orgFilter) {
        url = `
          ${url}${memberTypeFilter.map((x) => `&organisation=${x}`).join("")}
        `;
      }
      if (iscoFilter && !orgFilter) {
        url = `
          ${url}${iscoFilter.map((x) => `&organisation=${x}`).join("")}
        `;
      }
      api
        .get("/organisation/")
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          setData([]);
        });
    }
  }, [reload]);

  console.log("iscoFilter", iscoFilter);
  console.log("memberTypeFilter", memberTypeFilter);
  console.log("memberNameFilter", memberNameFilter);

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
                <Input
                  className="input-search"
                  placeholder="Search member by name"
                  prefix={<FaSearch />}
                  value={search}
                  onChange={handleSearchMemberByName}
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
                dataSource={data || []}
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
