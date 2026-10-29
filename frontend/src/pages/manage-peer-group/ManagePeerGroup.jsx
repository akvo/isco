import React, { useState, useEffect, useCallback } from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Button,
  Spin,
  Alert,
  Empty,
} from "antd";
import { RiArrowLeftLine, RiPencilFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { api, store } from "../../lib";
import EditPeerGroupMappingModal from "./EditPeerGroupMappingModal";

const { Title, Text, Paragraph } = Typography;

const PEER_GROUP_COLORS = {
  trader_processor: "blue",
  large_manufacturer: "gold",
  sme: "cyan",
  retail: "green",
};

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

  return (
    <div id="manage-peer-group">
      <Row justify="space-between" align="middle" className="header-row">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Manage Peer Groups
          </Title>
          <Text type="secondary">
            Configure which platform member types map to each harmonized peer
            group cohort.
          </Text>
        </Col>
        <Col>
          <Button
            type="default"
            icon={<RiArrowLeftLine style={{ marginRight: 6 }} />}
            onClick={() => navigate("/admin")}
          >
            Back to Admin
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" tip="Loading peer groups..." />
        </div>
      ) : peerGroups.length === 0 ? (
        <Empty description="No peer groups found." />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {peerGroups.map((group) => {
              const tagColor = PEER_GROUP_COLORS[group.code] || "blue";
              const mappedCount = (group.member_types || []).length;

              return (
                <Col xs={24} md={12} key={group.id}>
                  <Card
                    className="peer-group-card"
                    title={
                      <div className="card-title-wrap">
                        <span className="peer-name">{group.name}</span>
                        <Tag color={tagColor}>{group.code}</Tag>
                      </div>
                    }
                  >
                    <Paragraph className="desc-text">
                      {group.description || "No description provided."}
                    </Paragraph>

                    <div className="mappings-section">
                      <div className="mappings-title">
                        Mapped Member Types ({mappedCount}):
                      </div>
                      <div className="tags-container">
                        {mappedCount > 0 ? (
                          group.member_types.map((mt) => (
                            <Tag
                              key={mt.id}
                              className="member-type-tag"
                              color="default"
                            >
                              {mt.name}
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary" italic>
                            No member types mapped to this peer group.
                          </Text>
                        )}
                      </div>
                    </div>

                    <div className="action-row">
                      <Button
                        type="primary"
                        ghost
                        icon={<RiPencilFill style={{ marginRight: 6 }} />}
                        onClick={() => handleEditClick(group)}
                      >
                        Edit Mappings
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {unmappedTypes.length > 0 && (
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
                      <Tag key={mt.id} color="warning">
                        {mt.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </>
      )}

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
