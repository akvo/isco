import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ManagePeerGroup from "./ManagePeerGroup";
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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockPeerGroups = [
  {
    id: 1,
    name: "Trader / Processor",
    code: "trader_processor",
    description: "Cocoa bean traders, processors, and grinders.",
    member_types: [
      { id: 101, name: "Trader" },
      { id: 102, name: "Processor" },
    ],
  },
  {
    id: 2,
    name: "Large Manufacturer",
    code: "large_manufacturer",
    description: "Multinational chocolate manufacturers and brands.",
    member_types: [{ id: 103, name: "Chocolate Brand" }],
  },
];

describe("ManagePeerGroup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.update((s) => {
      s.optionValues = {
        member_type: [
          { id: 101, name: "Trader" },
          { id: 102, name: "Processor" },
          { id: 103, name: "Chocolate Brand" },
          { id: 104, name: "Unmapped NGO" },
        ],
      };
    });

    jest.spyOn(api, "get").mockResolvedValue({
      data: mockPeerGroups,
    });
  });

  afterEach(() => {
    api.get.mockRestore();
  });

  test("renders page header matching ISCO admin design standard", async () => {
    render(<ManagePeerGroup />);

    expect(screen.getByText("Manage Peer Groups")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Configure which platform member types map to each harmonized peer group cohort/i
      )
    ).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /Back to Admin/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  test("renders peer group table with columns, codes, descriptions, and tags", async () => {
    render(<ManagePeerGroup />);

    await waitFor(() => {
      expect(screen.getByText("Trader / Processor")).toBeInTheDocument();
      expect(screen.getByText("Large Manufacturer")).toBeInTheDocument();
    });

    // Check code tags
    expect(screen.getByText("trader_processor")).toBeInTheDocument();
    expect(screen.getByText("large_manufacturer")).toBeInTheDocument();

    // Check mapped tags
    expect(screen.getByText("Trader")).toBeInTheDocument();
    expect(screen.getByText("Processor")).toBeInTheDocument();
    expect(screen.getByText("Chocolate Brand")).toBeInTheDocument();

    // Check descriptions
    expect(
      screen.getByText("Cocoa bean traders, processors, and grinders.")
    ).toBeInTheDocument();
  });

  test("renders unmapped member types alert when unassigned member types exist", async () => {
    render(<ManagePeerGroup />);

    await waitFor(() => {
      expect(screen.getByText("Unmapped Member Types")).toBeInTheDocument();
    });

    expect(screen.getByText("Unmapped NGO")).toBeInTheDocument();
  });

  test("opens edit mapping modal when clicking edit action button", async () => {
    render(<ManagePeerGroup />);

    await waitFor(() => {
      expect(screen.getByText("Trader / Processor")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: "" });
    // Click the first action button
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Edit Member Types: Trader / Processor")
      ).toBeInTheDocument();
    });
  });
});
