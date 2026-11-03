import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MemberDashboardPage from "./MemberDashboardPage";
import { api, store } from "../../lib";

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

jest.mock("../../lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

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

const mockDashboardData = {
  organisation: {
    id: 45,
    name: "Chocolatier Example AG",
    peer_group: {
      id: 2,
      code: "large_manufacturer",
      name: "Large Manufacturer",
    },
  },
  years: [2022, 2023, 2024],
  peer_groups: [
    { id: 1, code: "trader_processor", name: "Trader/Processor" },
    { id: 2, code: "large_manufacturer", name: "Large Manufacturer" },
    { id: 3, code: "sme", name: "SME" },
    { id: 4, code: "retail", name: "Retail" },
  ],
  enable_peer_group_filter: true,
  challenges: [
    {
      id: "transparency_and_traceability",
      name: "Transparency and traceability",
      indicators: [
        {
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
        },
      ],
    },
    {
      id: "living_income",
      name: "Living income",
      indicators: [],
    },
    {
      id: "deforestation",
      name: "Deforestation",
      indicators: [],
    },
    {
      id: "child_labour",
      name: "Child labour",
      indicators: [],
    },
  ],
};

const mockOrganisations = [
  { id: 45, name: "Chocolatier Example AG", active: true },
  { id: 46, name: "Cocoa Trader GmbH", active: true },
  { id: 47, name: "Retail Mart SE", active: true },
];

describe("MemberDashboardPage Shell Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.update((s) => {
      s.user = {
        id: 1,
        name: "Test Member",
        role: "member_user",
        organisation: 45,
      };
      s.language = {
        active: "en",
        langs: { en: "English", de: "German" },
      };
      s.optionValues = {
        ...s.optionValues,
        organisation: mockOrganisations,
      };
    });
  });

  test("renders loading skeleton while fetching dashboard data", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    const { container } = render(<MemberDashboardPage />);
    expect(container.querySelector(".ant-skeleton")).toBeInTheDocument();
  });

  test("renders dashboard header, static peer group tag, and challenge sections on success", async () => {
    api.get.mockResolvedValueOnce({ data: mockDashboardData });

    render(<MemberDashboardPage />);

    // Wait for title with member organisation name
    await waitFor(() => {
      expect(
        screen.getByText(
          /Individual Reporting Back Dashboard – Chocolatier Example AG/i
        )
      ).toBeInTheDocument();
    });

    // Subtitle check
    expect(
      screen.getByText(
        /Overview of performance per challenge – Member vs Large Manufacturer average over time \(2022 - 2024\)/i
      )
    ).toBeInTheDocument();

    // Static Peer Group tag/badge check
    const peerGroupTag = screen.getByText(/Peer Group: Large Manufacturer/i);
    expect(peerGroupTag).toBeInTheDocument();
    expect(peerGroupTag.closest(".ant-tag")).toBeInTheDocument();

    // 4 Challenge section titles
    expect(
      screen.getByText("Transparency and traceability")
    ).toBeInTheDocument();
    expect(screen.getByText("Living income")).toBeInTheDocument();
    expect(screen.getByText("Deforestation")).toBeInTheDocument();
    expect(screen.getByText("Child labour")).toBeInTheDocument();

    // Verify IndicatorLineChartCard rendering
    expect(
      screen.getByText("Share of cocoa sourced directly")
    ).toBeInTheDocument();
    expect(screen.getByTestId("akvo-line-chart")).toBeInTheDocument();

    // Standard member should not see secretariat organisation switcher
    expect(
      screen.queryByTestId("secretariat-org-switcher")
    ).not.toBeInTheDocument();
  });

  test("renders Secretariat organisation switcher for secretariat_admin and handles switching", async () => {
    store.update((s) => {
      s.user = {
        id: 99,
        name: "Admin User",
        role: "secretariat_admin",
        organisation: { id: 45, name: "Chocolatier Example AG" },
      };
    });

    api.get.mockResolvedValueOnce({ data: mockDashboardData });

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Individual Reporting Back Dashboard – Chocolatier Example AG/i
        )
      ).toBeInTheDocument();
    });

    // Switcher should be visible
    const switcher = screen.getByTestId("secretariat-org-switcher");
    expect(switcher).toBeInTheDocument();

    // Verify initial API call was made with extracted integer ID (not object)
    expect(api.get).toHaveBeenCalledWith(
      "/visualization/individual-dashboard",
      expect.objectContaining({
        params: { organisation_id: 45 },
      })
    );
  });

  test("renders error alert with retry button when API fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByText(/Retry/i);
    expect(retryBtn).toBeInTheDocument();

    // Retry should trigger another call
    api.get.mockResolvedValueOnce({ data: mockDashboardData });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Individual Reporting Back Dashboard – Chocolatier Example AG/i
        )
      ).toBeInTheDocument();
    });
  });

  test("renders empty state when no challenges or organisation returned", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        organisation: null,
        years: [],
        challenges: [],
      },
    });

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /No reporting back performance data is available for this organization/i
        )
      ).toBeInTheDocument();
    });
  });

  test("respects active language and renders German translations correctly when active language is de", async () => {
    store.update((s) => {
      s.language = {
        active: "de",
        langs: { en: "English", de: "German" },
      };
    });

    api.get.mockResolvedValueOnce({ data: mockDashboardData });

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Individuelles Reporting-Back Dashboard – Chocolatier Example AG/i
        )
      ).toBeInTheDocument();
    });

    // Subtitle check in German
    expect(
      screen.getByText(
        /Leistungsübersicht pro Herausforderung – Mitglied vs\. Großer Hersteller Durchschnitt im Zeitverlauf \(2022 - 2024\)/i
      )
    ).toBeInTheDocument();

    // Static Peer Group tag/badge check in German
    const peerGroupTag = screen.getByText(
      /Vergleichsgruppe: Großer Hersteller/i
    );
    expect(peerGroupTag).toBeInTheDocument();

    // 4 Challenge section titles in German
    expect(
      screen.getByText("Transparenz und Rückverfolgbarkeit")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Existenzsicherndes Einkommen")
    ).toBeInTheDocument();
    expect(screen.getByText("Entwaldung")).toBeInTheDocument();
    expect(screen.getByText("Kinderarbeit")).toBeInTheDocument();

    // Indicator name in German
    expect(
      screen.getByText("Anteil direkt bezogenen Kakaos")
    ).toBeInTheDocument();
  });

  test("renders peer group benchmark selector and fetches with peer_group_id when changed", async () => {
    api.get.mockResolvedValueOnce({ data: mockDashboardData });

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId("peer-group-selector")).toBeInTheDocument();
    });

    const selector = screen.getByTestId("peer-group-selector");
    expect(selector).toBeInTheDocument();

    // Verify initial call without peer_group_id
    expect(api.get).toHaveBeenCalledWith(
      "/visualization/individual-dashboard",
      expect.objectContaining({
        params: {},
      })
    );

    // Mock response for peer group change
    const traderGroupData = {
      ...mockDashboardData,
      organisation: {
        ...mockDashboardData.organisation,
        peer_group: {
          id: 1,
          code: "trader_processor",
          name: "Trader/Processor",
        },
      },
    };
    api.get.mockResolvedValueOnce({ data: traderGroupData });

    // Ant Design Select opens dropdown on mouseDown
    const selectTrigger = selector.querySelector(".ant-select-selector");
    fireEvent.mouseDown(selectTrigger);

    // Click Trader/Processor option
    const traderOption = await screen.findByText("Trader/Processor");
    fireEvent.click(traderOption);

    // Verify API called with peer_group_id: 1
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/visualization/individual-dashboard",
        expect.objectContaining({
          params: { peer_group_id: 1 },
        })
      );
    });
  });

  test("hides peer group selector when enable_peer_group_filter is false", async () => {
    const disabledFlagData = {
      ...mockDashboardData,
      enable_peer_group_filter: false,
    };
    api.get.mockResolvedValueOnce({ data: disabledFlagData });

    render(<MemberDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Individual Reporting Back Dashboard – Chocolatier Example AG/i
        )
      ).toBeInTheDocument();
    });

    // Static tag still renders
    expect(
      screen.getByText(/Peer Group: Large Manufacturer/i)
    ).toBeInTheDocument();

    // Dropdown selector is hidden
    expect(screen.queryByTestId("peer-group-selector")).not.toBeInTheDocument();
  });
});
