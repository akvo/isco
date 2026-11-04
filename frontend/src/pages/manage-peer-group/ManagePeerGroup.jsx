import React, { useState, useEffect, useCallback } from "react";
import "./styles.scss";
import { Row, Col, Typography, Tag, Button, Table, Space, Alert } from "antd";
import { RiPencilFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { api, store } from "../../lib";
import EditPeerGroupMappingModal from "./EditPeerGroupMappingModal";

const { Title, Text } = Typography;

const ManagePeerGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [peerGroups, setPeerGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { optionValues } = store.useState((s) => s);
  const allMemberTypes = (optionValues?.member_type || []).filter(
    (m) => m.name !== "All"
  );

  const fetchPeerGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/peer_group/");
      setPeerGroups(res.data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeerGroups();
  }, [fetchPeerGroups]);

  // Compute unmapped member types across all peer groups
  const mappedMemberTypeIds = new Set();
  peerGroups.forEach((pg) => {
    (pg.member_types || []).forEach((mt) => mappedMemberTypeIds.add(mt.id));
  });

  const unmappedTypes = allMemberTypes.filter(
    (mt) => !mappedMemberTypeIds.has(mt.id)
  );

  const handleEditClick = (group) => {
    setSelectedGroup(group);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedGroup(null);
  };

  const columns = [
    {
      title: "Peer Group",
      key: "name",
      width: "25%",
      render: (record) => (
        <div className="peer-group-title-col">
          <div className="title">{record.name}</div>
          <Tag className="code-tag">{record.code}</Tag>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text) => (
        <span className="desc-text">{text || "No description provided."}</span>
      ),
    },
    {
      title: "Mapped Member Types",
      key: "member_types",
      width: "35%",
      render: (record) => {
        const types = record.member_types || [];
        if (types.length === 0) {
          return (
            <Text type="secondary" italic>
              No member types mapped
            </Text>
          );
        }
        return (
          <div className="tags-container">
            {types.map((mt) => (
              <Tag key={mt.id} className="member-type-tag">
                {mt.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      align: "center",
      render: (record) => (
        <Space key={`action-${record.id}`}>
          <Button
            className="action-btn"
            icon={<RiPencilFill />}
            shape="circle"
            type="text"
            onClick={() => handleEditClick(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div id="manage-peer-group">
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
                Manage Peer Groups
              </Title>
            </Col>
            <Col align="end">
              <Button
                className="button-back"
                type="primary"
                ghost
                onClick={() => navigate("/admin")}
              >
                Back to Admin
              </Button>
            </Col>
          </Row>

          <Row className="page-sub-header">
            <Col span={24}>
              <Text className="header-subtitle">
                Configure which platform member types map to each harmonized
                peer group cohort.
              </Text>
            </Col>
          </Row>

          <Row className="table-wrapper">
            <Col span={24}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={peerGroups}
                loading={loading}
                pagination={false}
              />
            </Col>
          </Row>

          {!loading && unmappedTypes.length > 0 && (
            <Alert
              className="unmapped-alert"
              type="info"
              showIcon
              message="Unmapped Member Types"
              description={
                <div>
                  <Text>
                    The following member types are currently not assigned to any
                    peer group cohort (e.g. non-reporting entities or
                    unclassified roles):
                  </Text>
                  <div className="unmapped-tags">
                    {unmappedTypes.map((mt) => (
                      <Tag key={mt.id} className="unmapped-tag">
                        {mt.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </Col>
      </Row>

      {selectedGroup && (
        <EditPeerGroupMappingModal
          visible={isModalVisible}
          peerGroup={selectedGroup}
          onClose={handleModalClose}
          onSuccess={fetchPeerGroups}
        />
      )}
    </div>
  );
};

export default ManagePeerGroup;
