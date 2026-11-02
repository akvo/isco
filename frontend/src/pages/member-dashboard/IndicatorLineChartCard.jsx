import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Card, Tag, Table } from "antd";
import { Line } from "akvo-charts";
import "akvo-charts/dist/index.css";
import { store } from "../../lib";
import { uiText } from "../../static";

const toNumericPercent = (val) => {
  if (val === null || typeof val === "undefined") {
    return null;
  }
  const num = Number(val);
  if (Number.isNaN(num)) {
    return null;
  }
  const scaled = Math.abs(num) <= 1.0 && num !== 0 ? num * 100 : num;
  return Number(scaled.toFixed(1));
};

const formatPercent = (val, naText = "N/A") => {
  if (val === null || typeof val === "undefined") {
    return naText;
  }
  const num = Number(val);
  if (Number.isNaN(num)) {
    return naText;
  }
  const scaled = Math.abs(num) <= 1.0 && num !== 0 ? num * 100 : num;
  return `${scaled.toFixed(1)}%`;
};

const IndicatorLineChartCard = ({ indicator, peerGroupName }) => {
  const { language } = store.useState((s) => s);
  const activeLang = language?.active || "en";
  const text = useMemo(() => uiText[activeLang] || uiText.en, [activeLang]);

  const naLabel = text.dashboardDataUnavailable || "N/A";

  const indicatorName = useMemo(() => {
    if (!indicator) {
      return "";
    }
    return text.indicators?.[indicator.id] || indicator.name;
  }, [indicator, text]);

  const unitName = useMemo(() => {
    if (!indicator?.unit) {
      return "";
    }
    return text.units?.[indicator.unit.toLowerCase()] || indicator.unit;
  }, [indicator, text]);

  const rawConfig = useMemo(() => {
    const seriesData = indicator?.series || [];
    const years = seriesData.map((s) => String(s.year));

    const memberData = seriesData.map((s) => toNumericPercent(s.member));
    const iscoData = seriesData.map((s) => toNumericPercent(s.isco_avg));
    const giscoData = seriesData.map((s) => toNumericPercent(s.gisco_avg));

    const memberLegend = text.dashboardLegendMember || "Member";
    const iscoLegend = text.dashboardLegendIscoAvg || "ISCO Peer Average";
    const giscoLegend = text.dashboardLegendGiscoAvg || "GISCO Average";

    return {
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) =>
          value !== null && typeof value !== "undefined"
            ? `${value}%`
            : naLabel,
      },
      legend: {
        show: true,
        top: 0,
        left: "center",
        itemGap: 16,
        data: [memberLegend, iscoLegend, giscoLegend],
        textStyle: {
          fontSize: 12,
          color: "#475569",
        },
      },
      grid: {
        top: 36,
        left: "2%",
        right: "4%",
        bottom: "4%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: years,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontWeight: 500 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
          color: "#64748b",
        },
        splitLine: {
          lineStyle: {
            color: "#f1f5f9",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: memberLegend,
          type: "line",
          data: memberData,
          itemStyle: { color: "#1890ff" },
          lineStyle: { width: 3, type: "solid", color: "#1890ff" },
          symbol: "circle",
          symbolSize: 8,
          connectNulls: false,
        },
        {
          name: iscoLegend,
          type: "line",
          data: iscoData,
          itemStyle: { color: "#fa8c16" },
          lineStyle: { width: 2, type: "dashed", color: "#fa8c16" },
          symbol: "rect",
          symbolSize: 6,
          connectNulls: false,
        },
        {
          name: giscoLegend,
          type: "line",
          data: giscoData,
          itemStyle: { color: "#52c41a" },
          lineStyle: { width: 2, type: "dotted", color: "#52c41a" },
          symbol: "triangle",
          symbolSize: 6,
          connectNulls: false,
        },
      ],
    };
  }, [indicator, text, naLabel]);

  const tableColumns = useMemo(() => {
    return [
      {
        title: text.dashboardTableColYear || "Year",
        dataIndex: "year",
        key: "year",
        align: "left",
        width: 70,
        className: "col-year",
      },
      {
        title: text.dashboardTableColMember || "Member",
        dataIndex: "member",
        key: "member",
        align: "right",
        className: "col-member",
        render: (val) => (
          <span className="member-cell-value">
            {formatPercent(val, naLabel)}
          </span>
        ),
      },
      {
        title: text.dashboardTableColIscoAvg || "ISCO Avg",
        dataIndex: "isco_avg",
        key: "isco_avg",
        align: "right",
        className: "col-isco",
        render: (val) => formatPercent(val, naLabel),
      },
      {
        title: text.dashboardTableColGiscoAvg || "GISCO Avg",
        dataIndex: "gisco_avg",
        key: "gisco_avg",
        align: "right",
        className: "col-gisco",
        render: (val) => formatPercent(val, naLabel),
      },
    ];
  }, [text, naLabel]);

  const tableDataSource = useMemo(() => {
    return (indicator?.series || []).map((s) => ({
      key: s.year,
      year: s.year,
      member: s.member,
      isco_avg: s.isco_avg,
      gisco_avg: s.gisco_avg,
    }));
  }, [indicator]);

  const isLowerBetter = indicator?.higher_is_better === false;

  return (
    <Card
      className="indicator-card indicator-chart-card"
      title={
        <div className="card-title-container">
          <div className="card-title-top-row">
            <span className="indicator-name">{indicatorName}</span>
          </div>
          <div className="card-title-sub-row">
            {indicator?.country && (
              <Tag className="scope-tag">{indicator.country}</Tag>
            )}
            {peerGroupName && (
              <span className="peer-group-hint" style={{ display: "none" }}>
                {peerGroupName}
              </span>
            )}
            {isLowerBetter && (
              <Tag
                className="polarity-badge polarity-badge-lower"
                color="orange"
              >
                ↓ {text.dashboardPolarityLowerBetter || "Lower is better"}
              </Tag>
            )}
            {!isLowerBetter && (
              <Tag className="polarity-badge polarity-badge-higher">
                ↑ {text.dashboardPolarityHigherBetter || "Higher is better"}
              </Tag>
            )}
          </div>
        </div>
      }
      extra={unitName ? <Tag className="unit-tag">{unitName}</Tag> : null}
    >
      <div className="chart-canvas-wrapper">
        <Line rawConfig={rawConfig} />
      </div>

      <div className="accompanying-data-grid">
        <Table
          dataSource={tableDataSource}
          columns={tableColumns}
          pagination={false}
          size="small"
          bordered={false}
          className="indicator-compact-table"
        />
      </div>
    </Card>
  );
};

IndicatorLineChartCard.propTypes = {
  indicator: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    country: PropTypes.string,
    unit: PropTypes.string,
    chart_type: PropTypes.string,
    higher_is_better: PropTypes.bool,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        member: PropTypes.number,
        isco_avg: PropTypes.number,
        gisco_avg: PropTypes.number,
      })
    ),
  }),
  peerGroupName: PropTypes.string,
};

IndicatorLineChartCard.defaultProps = {
  indicator: null,
  peerGroupName: "",
};

export default IndicatorLineChartCard;
