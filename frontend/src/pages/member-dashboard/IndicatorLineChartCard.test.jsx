import React from "react";
import { render, screen } from "@testing-library/react";
import IndicatorLineChartCard from "./IndicatorLineChartCard";
import { store } from "../../lib";

// Mock matchMedia for Ant Design components in jsdom
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
});

// Mock akvo-charts Line component to inspect rawConfig in tests
jest.mock("akvo-charts", () => ({
  __esModule: true,
  Line: ({ rawConfig }) => (
    <div
      data-testid="akvo-line-chart"
      data-rawconfig={JSON.stringify(rawConfig)}
    >
      Mocked Akvo Line Chart
    </div>
  ),
}));

const mockIndicatorPercentage = {
  id: "sourced_directly",
  name: "Share of cocoa sourced directly",
  country: "Global",
  unit: "percentage",
  chart_type: "line",
  higher_is_better: true,
  series: [
    { year: 2022, member: 0.3422, isco_avg: 0.364, gisco_avg: 0.37 },
    { year: 2023, member: 0.7056, isco_avg: 0.7, gisco_avg: 0.65 },
    { year: 2024, member: 0.4854, isco_avg: 0.465, gisco_avg: 0.49 },
  ],
};

const mockIndicatorWithMissingDataAndInvertedPolarity = {
  id: "child_labour_identified",
  name: "Share of cases of child labour identified among children covered",
  country: "West Africa",
  unit: "ratio",
  chart_type: "line",
  higher_is_better: false,
  series: [
    { year: 2022, member: null, isco_avg: 0.052, gisco_avg: 0.048 },
    { year: 2023, member: 0.038, isco_avg: 0.044, gisco_avg: 0.041 },
    { year: 2024, member: 0.025, isco_avg: 0.039, gisco_avg: 0.035 },
  ],
};

describe("IndicatorLineChartCard Component (TASK-06)", () => {
  beforeEach(() => {
    store.update((s) => {
      s.language = {
        active: "en",
        langs: { en: "English", de: "German" },
      };
    });
  });

  test("renders card header with indicator name, country scope, and unit tag", () => {
    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorPercentage}
        peerGroupName="Large Manufacturer"
      />
    );

    expect(
      screen.getByText("Share of cocoa sourced directly")
    ).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();
    expect(screen.getByText("Percentage")).toBeInTheDocument();
  });

  test("normalizes API series data into ECharts rawConfig with 3 distinct curves (UAC-06.1, TAC-06.1, TAC-06.2)", () => {
    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorPercentage}
        peerGroupName="Large Manufacturer"
      />
    );

    const chartElem = screen.getByTestId("akvo-line-chart");
    expect(chartElem).toBeInTheDocument();

    const rawConfig = JSON.parse(chartElem.getAttribute("data-rawconfig"));

    // Check xAxis years
    expect(rawConfig.xAxis.data).toEqual(["2022", "2023", "2024"]);

    // Check 3 series curves
    expect(rawConfig.series).toHaveLength(3);

    // 1. Member curve: Solid blue (#1890ff), 3px width, circle symbol
    const memberSeries = rawConfig.series[0];
    expect(memberSeries.name).toBe("Member");
    expect(memberSeries.type).toBe("line");
    expect(memberSeries.itemStyle.color).toBe("#1890ff");
    expect(memberSeries.lineStyle.width).toBe(3);
    expect(memberSeries.lineStyle.type).toBe("solid");
    expect(memberSeries.symbol).toBe("circle");
    expect(memberSeries.symbolSize).toBe(8);
    expect(memberSeries.connectNulls).toBe(false);
    expect(memberSeries.data).toEqual([34.2, 70.6, 48.5]);

    // 2. ISCO Peer Average curve: Dashed orange (#fa8c16), 2px width, rect symbol
    const iscoSeries = rawConfig.series[1];
    expect(iscoSeries.name).toBe("ISCO Peer Average");
    expect(iscoSeries.type).toBe("line");
    expect(iscoSeries.itemStyle.color).toBe("#fa8c16");
    expect(iscoSeries.lineStyle.width).toBe(2);
    expect(iscoSeries.lineStyle.type).toBe("dashed");
    expect(iscoSeries.symbol).toBe("rect");
    expect(iscoSeries.symbolSize).toBe(6);
    expect(iscoSeries.connectNulls).toBe(false);
    expect(iscoSeries.data).toEqual([36.4, 70.0, 46.5]);

    // 3. GISCO Average curve: Dotted green (#52c41a), 2px width, triangle symbol
    const giscoSeries = rawConfig.series[2];
    expect(giscoSeries.name).toBe("GISCO Average");
    expect(giscoSeries.type).toBe("line");
    expect(giscoSeries.itemStyle.color).toBe("#52c41a");
    expect(giscoSeries.lineStyle.width).toBe(2);
    expect(giscoSeries.lineStyle.type).toBe("dotted");
    expect(giscoSeries.symbol).toBe("triangle");
    expect(giscoSeries.symbolSize).toBe(6);
    expect(giscoSeries.connectNulls).toBe(false);
    expect(giscoSeries.data).toEqual([37.0, 65.0, 49.0]);
  });

  test("handles missing survey years as disconnected null gaps without breaking (UAC-06.3, TAC-06.4)", () => {
    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorWithMissingDataAndInvertedPolarity}
        peerGroupName="Large Manufacturer"
      />
    );

    const chartElem = screen.getByTestId("akvo-line-chart");
    const rawConfig = JSON.parse(chartElem.getAttribute("data-rawconfig"));

    // 2022 member value was null, should remain null in series data (not 0)
    expect(rawConfig.series[0].data[0]).toBeNull();
    expect(rawConfig.series[0].connectNulls).toBe(false);
  });

  test("displays polarity indicator for indicators where lower is better (UAC-06.4)", () => {
    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorWithMissingDataAndInvertedPolarity}
        peerGroupName="Large Manufacturer"
      />
    );

    // Polarity cue for child labour identification
    const polarityTag = screen.getByText(/Lower is better/i);
    expect(polarityTag).toBeInTheDocument();
    expect(polarityTag.closest(".polarity-badge-lower")).toBeInTheDocument();
  });

  test("renders accompanying compact data grid beneath the chart with exact values and N/A for missing data (UAC-06.5)", () => {
    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorWithMissingDataAndInvertedPolarity}
        peerGroupName="Large Manufacturer"
      />
    );

    // Table Column Headers
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("ISCO Avg")).toBeInTheDocument();
    expect(screen.getByText("GISCO Avg")).toBeInTheDocument();

    // Row 2022: Member is null -> N/A
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("5.2%")).toBeInTheDocument();
    expect(screen.getByText("4.8%")).toBeInTheDocument();

    // Row 2023: Member is 0.038 -> 3.8%
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("3.8%")).toBeInTheDocument();
    expect(screen.getByText("4.4%")).toBeInTheDocument();
    expect(screen.getByText("4.1%")).toBeInTheDocument();
  });

  test("renders localized German translations when language is de", () => {
    store.update((s) => {
      s.language = {
        active: "de",
        langs: { en: "English", de: "German" },
      };
    });

    render(
      <IndicatorLineChartCard
        indicator={mockIndicatorWithMissingDataAndInvertedPolarity}
        peerGroupName="Large Manufacturer"
      />
    );

    // German Table Column Headers
    expect(screen.getByText("Jahr")).toBeInTheDocument();
    expect(screen.getByText("Mitglied")).toBeInTheDocument();
    expect(screen.getByText("ISCO Ø")).toBeInTheDocument();
    expect(screen.getByText("GISCO Ø")).toBeInTheDocument();

    // German Polarity Cue
    expect(screen.getByText(/Niedrigerer Wert = Besser/i)).toBeInTheDocument();

    // German Missing Value
    expect(screen.getByText("k.A.")).toBeInTheDocument();
  });
});
