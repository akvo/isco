import React, { useState, useEffect } from "react";
import "./styles.scss";

import { Button, Col, Row, Typography, Table, Space, Select } from "antd";
import { RiPencilFill } from "react-icons/ri";

import AddMember from "./AddMember";
import { api, store } from "../../lib";
import { globalSelectProps } from "../../lib/util";

const { Title } = Typography;

const ManageMember = () => {
  const { isLoggedIn, optionValues } = store.useState((s) => s);
  const { organisation, member_type, isco_type } = optionValues;
  const memberType = member_type.filter((isco) => isco.name !== "All");
  const iscoType = isco_type.filter((isco) => isco.name !== "All");
  const memberNameOptions = organisation.map((org) => {
    return { id: org.id, name: org.name };
  });

  const firstPage = 1;
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
      width: "35%",
    },
    {
      title: "Member Type",
      dataIndex: "member",
      key: "member_type",
      width: "30%",
    },
    {
      title: "ISCO",
      dataIndex: "isco",
      key: "isco_type",
      width: "25%",
    },
    {
      title: "Action",
      width: "10%",
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
    setPage(firstPage);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      let url = `/organisation/paginated?page=${page}&page_size=${pageSize}`;
      if (memberName) {
        url = `${url}&organisation=${memberName}`;
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
            // handle all option value
            const members = o.member_type.includes(1)
              ? ["All"]
              : [o.member.join(", ")];
            const iscos = o.isco_type.includes(1)
              ? ["All"]
              : [o.isco.join(", ")];
            // eol handle all option value
            const findOrganisation = organisation.find((el) => el.id === o.id);
            return {
              ...o,
              member: members,
              isco: iscos,
              organisation_name: findOrganisation?.name,
            };
          });
          setIsLoading(false);
          setData({
            ...data,
            data: orgs,
          });
        })
        .catch((e) => {
          console.info(e);
          setIsLoading(false);
          setData([]);
        });
    }
  }, [
    isLoggedIn,
    reload,
    page,
    organisation,
    memberName,
    iscoValue,
    memberValue,
    memberNameFilter,
    memberTypeFilter,
    iscoFilter,
  ]);

  const handleMemberNameFilter = (val) => {
    setPage(firstPage);
    setMemberName(val);
    let orgs = organisation;
    orgs = orgs.filter((o) => {
      return o.id === val;
    });
    orgs = orgs.length ? orgs : null;
    setMemberNameFilter(orgs);
  };

  const handleMemberFilter = (member) => {
    setPage(firstPage);
    setMemberValue(member);
    let orgs = organisation;
    orgs = orgs.filter((o) => o.member_type.includes(member));
    orgs = orgs.length ? orgs : null;
    setMemberTypeFilter(orgs);
  };

  const handleIscoFilter = (isco) => {
    setPage(firstPage);
    setIscoValue(isco);
    let orgs = organisation;
    orgs = orgs.filter((o) => o.isco_type.includes(isco));
    orgs = orgs.length ? orgs : null;
    setIscoFilter(orgs);
  };

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
                  {...globalSelectProps}
                />
                <Select
                  showSearch
                  className="member-dropdown-wrapper"
                  placeholder="Member Type"
                  options={
                    memberType.length
                      ? memberType.map((o) => ({
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
                  {...globalSelectProps}
                />
                <Select
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
                  {...globalSelectProps}
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
