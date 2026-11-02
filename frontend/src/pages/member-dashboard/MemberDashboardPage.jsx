import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Select,
  Skeleton,
  Alert,
  Empty,
  Button,
} from "antd";
import { store, api } from "../../lib";
import { globalSelectProps } from "../../lib/util";
import { uiText } from "../../static";

const { Title, Text } = Typography;
const { Option } = Select;

const getCleanOrgId = (org) => {
  if (!org) {
    return null;
  }
  if (typeof org === "object") {
    return org.id ? Number(org.id) : null;
  }
  const num = Number(org);
  return Number.isNaN(num) ? null : num;
};

const MemberDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const { user, optionValues, language } = store.useState((s) => s);
  const activeLang = language?.active || "en";
  const text = useMemo(() => uiText[activeLang] || uiText.en, [activeLang]);

  const isAdmin = user?.role === "secretariat_admin";
  const [selectedOrgId, setSelectedOrgId] = useState(() =>
    getCleanOrgId(user?.organisation)
  );
  const abortControllerRef = useRef(null);

  // Sync selectedOrgId when user profile loads if not set
  useEffect(() => {
    const cleanId = getCleanOrgId(user?.organisation);
    if (cleanId && !selectedOrgId) {
      setSelectedOrgId(cleanId);
    }
  }, [user?.organisation, selectedOrgId]);

  const fetchDashboard = useCallback(
    async (orgId) => {
      // Cancel prior pending request if in-flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const params = {};
        const cleanOrgId = getCleanOrgId(orgId);
        if (isAdmin && cleanOrgId) {
          params.organisation_id = cleanOrgId;
        }

        const res = await api.get("/visualization/individual-dashboard", {
          params,
          signal: abortControllerRef.current.signal,
        });

        setDashboardData(res.data);
        setLoading(false);
      } catch (err) {
        // Ignore aborted errors
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load dashboard"
        );
        setLoading(false);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    fetchDashboard(selectedOrgId);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDashboard, selectedOrgId]);

  const handleOrganisationChange = (newOrgId) => {
    setSelectedOrgId(newOrgId);
  };

  const handleRetry = () => {
    fetchDashboard(selectedOrgId);
  };

  const yearsRange = useMemo(() => {
    if (!dashboardData?.years || !dashboardData.years.length) {
      return "";
    }
    const sorted = [...dashboardData.years].sort((a, b) => a - b);
    if (sorted.length === 1) {
      return `${sorted[0]}`;
    }
    return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
  }, [dashboardData]);

  const availableOrganisations = useMemo(() => {
    return (optionValues?.organisation || []).filter((o) => o?.active);
  }, [optionValues]);

  const getPeerGroupName = (peerGroup) => {
    if (!peerGroup) {
      return "";
    }
    return text.peerGroups?.[peerGroup.code] || peerGroup.name || "Peer Group";
  };

  const getChallengeName = (challenge) => {
    if (!challenge) {
      return "";
    }
    return text.challenges?.[challenge.id] || challenge.name;
  };

  const getIndicatorName = (indicator) => {
    if (!indicator) {
      return "";
    }
    return text.indicators?.[indicator.id] || indicator.name;
  };

  const getUnitName = (unit) => {
    if (!unit) {
      return "";
    }
    return text.units?.[unit.toLowerCase()] || unit;
  };

  const getIndicatorCountLabel = (count) => {
    const noun =
      count === 1
        ? text.dashboardIndicatorCountSingular || "indicator"
        : text.dashboardIndicatorCountPlural || "indicators";
    return `${count} ${noun}`;
  };

  return (
    <div className="member-dashboard-page">
      <div className="member-dashboard-container">
        {/* Header Shell */}
        <header className="dashboard-header">
          <Row align="middle" justify="space-between" gutter={[24, 24]}>
            <Col xs={24} md={isAdmin ? 15 : 24} className="header-main">
              <span className="dashboard-eyebrow">
                {text.dashboardEyebrow || "ISCO Sustainability Reporting Back"}
              </span>

              {loading && !dashboardData ? (
                <Skeleton
                  active
                  paragraph={{ rows: 2, width: ["80%", "60%"] }}
                  title={{ width: "50%" }}
                />
              ) : dashboardData?.organisation ? (
                <>
                  <Title level={2} className="dashboard-title">
                    {text.dashboardTitle} – {dashboardData.organisation.name}
                  </Title>
                  <Text className="dashboard-subtitle">
                    {text.dashboardSubtitlePrefix}{" "}
                    {getPeerGroupName(dashboardData.organisation.peer_group)}{" "}
                    {text.dashboardSubtitleSuffix}{" "}
                    {yearsRange ? `(${yearsRange})` : ""}
                  </Text>
                  <div className="header-credentials-bar">
                    {dashboardData.organisation.peer_group && (
                      <Tag className="peer-group-tag">
                        <span className="badge-dot" />
                        {text.peerGroupBadgePrefix}:{" "}
                        {getPeerGroupName(
                          dashboardData.organisation.peer_group
                        )}
                      </Tag>
                    )}
                    {yearsRange && (
                      <span className="year-range-chip">
                        <span className="chip-symbol">✦</span>
                        <span className="chip-label">{yearsRange}</span>
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <Title level={2} className="dashboard-title">
                  {text.dashboardTitle}
                </Title>
              )}
            </Col>

            {/* Secretariat Organisation Switcher */}
            {isAdmin && (
              <Col xs={24} md={9} className="secretariat-switcher-wrapper">
                <div className="secretariat-toolbar">
                  <div className="toolbar-top">
                    <span className="admin-mode-pill">
                      {text.dashboardAdminMode || "Secretariat Administration"}
                    </span>
                    <span className="switcher-label">
                      {text.selectOrganisationPlaceholder}
                    </span>
                  </div>
                  <Select
                    data-testid="secretariat-org-switcher"
                    className="secretariat-org-select"
                    showSearch
                    placeholder={text.selectOrganisationPlaceholder}
                    optionFilterProp="children"
                    value={selectedOrgId || dashboardData?.organisation?.id}
                    onChange={handleOrganisationChange}
                    {...globalSelectProps}
                  >
                    {availableOrganisations.map((org) => (
                      <Option key={org.id} value={org.id}>
                        {org.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            )}
          </Row>
        </header>

        {/* Content-Shaped Zero-CLS Skeleton */}
        {loading && (
          <div className="dashboard-skeleton-grid">
            {[1, 2].map((sIndex) => (
              <div key={sIndex} className="skeleton-challenge-block">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 220, marginBottom: 16 }}
                />
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <div className="skeleton-card">
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="skeleton-card">
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="dashboard-error-alert">
            <Alert
              message={text.dashboardErrorTitle}
              description={String(error)}
              type="error"
              showIcon
              action={
                <Button
                  size="small"
                  type="primary"
                  danger
                  onClick={handleRetry}
                  className="retry-btn"
                >
                  {text.dashboardRetryBtn}
                </Button>
              }
            />
          </div>
        )}

        {!loading &&
          !error &&
          (!dashboardData?.organisation ||
            !dashboardData?.challenges ||
            dashboardData.challenges.length === 0) && (
            <div className="dashboard-empty">
              <Empty
                description={text.dashboardEmptyDesc}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}

        {!loading &&
          !error &&
          dashboardData?.challenges &&
          dashboardData.challenges.length > 0 && (
            <main className="dashboard-challenges-container">
              {dashboardData.challenges.map((challenge) => {
                const indicatorCount = challenge.indicators?.length || 0;
                return (
                  <section key={challenge.id} className="challenge-section">
                    <div className="challenge-header-bar">
                      <div className="challenge-title-wrap">
                        <span className="challenge-pillar-indicator" />
                        <Title level={4} className="challenge-title">
                          {getChallengeName(challenge)}
                        </Title>
                      </div>
                      <span className="indicator-count-badge">
                        {getIndicatorCountLabel(indicatorCount)}
                      </span>
                    </div>

                    <Row gutter={[24, 24]}>
                      {(challenge.indicators || []).map((indicator) => (
                        <Col xs={24} lg={12} key={indicator.id}>
                          <Card
                            className="indicator-card"
                            title={
                              <div className="card-title-container">
                                <div className="card-title-top-row">
                                  <span className="indicator-name">
                                    {getIndicatorName(indicator)}
                                  </span>
                                </div>
                                {indicator.country && (
                                  <div className="card-title-sub-row">
                                    <Tag className="scope-tag">
                                      {indicator.country}
                                    </Tag>
                                  </div>
                                )}
                              </div>
                            }
                            extra={
                              indicator.unit ? (
                                <Tag className="unit-tag">
                                  {getUnitName(indicator.unit)}
                                </Tag>
                              ) : null
                            }
                          >
                            <div className="blueprint-canvas">
                              {/* Analytical Legend */}
                              <div className="blueprint-legend">
                                <div className="legend-item member-legend">
                                  <span className="legend-marker marker-member" />
                                  <span className="legend-text">
                                    {text.dashboardLegendMember || "Member"}
                                  </span>
                                </div>
                                <div className="legend-item peer-legend">
                                  <span className="legend-marker marker-peer" />
                                  <span className="legend-text">
                                    {text.dashboardLegendIscoAvg ||
                                      "ISCO Peer Avg"}
                                  </span>
                                </div>
                                <div className="legend-item national-legend">
                                  <span className="legend-marker marker-national" />
                                  <span className="legend-text">
                                    {text.dashboardLegendNationalAvg ||
                                      "National Avg"}
                                  </span>
                                </div>
                              </div>

                              {/* Stylized Metric Blueprint Visualizer */}
                              <div className="blueprint-grid-area">
                                <div className="grid-line" />
                                <div className="grid-line" />
                                <div className="grid-line" />
                                <svg
                                  className="blueprint-svg-lines"
                                  viewBox="0 0 360 80"
                                  preserveAspectRatio="none"
                                >
                                  {/* National baseline */}
                                  <path
                                    d="M 10 50 Q 180 40 350 45"
                                    className="svg-line-national"
                                  />
                                  {/* ISCO Peer baseline */}
                                  <path
                                    d="M 10 38 Q 180 52 350 32"
                                    className="svg-line-peer"
                                  />
                                  {/* Member solid trend */}
                                  <path
                                    d="M 10 58 Q 180 20 350 25"
                                    className="svg-line-member"
                                  />
                                  {/* Data node highlights */}
                                  <circle
                                    cx="10"
                                    cy="58"
                                    r="3.5"
                                    className="node-member"
                                  />
                                  <circle
                                    cx="180"
                                    cy="24"
                                    r="3.5"
                                    className="node-member"
                                  />
                                  <circle
                                    cx="350"
                                    cy="25"
                                    r="3.5"
                                    className="node-member"
                                  />
                                </svg>
                              </div>

                              {/* Axis Timeline */}
                              <div className="blueprint-axis-years">
                                {(dashboardData?.years || [2022, 2023, 2024])
                                  .slice(0, 5)
                                  .map((yr) => (
                                    <span key={yr} className="axis-year">
                                      {yr}
                                    </span>
                                  ))}
                              </div>

                              {/* Technical Status Caption */}
                              <div className="blueprint-caption">
                                <Text
                                  type="secondary"
                                  className="caption-label"
                                >
                                  {text.dashboardChartPlaceholder} (
                                  {indicator.country || "Global"})
                                </Text>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}

                      {(!challenge.indicators ||
                        challenge.indicators.length === 0) && (
                        <Col span={24}>
                          <Card className="indicator-card empty-indicator-card">
                            <div className="empty-challenge-body">
                              <Text type="secondary">
                                {text.dashboardNoIndicators}
                              </Text>
                            </div>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </section>
                );
              })}
            </main>
          )}
      </div>
    </div>
  );
};

export default MemberDashboardPage;
