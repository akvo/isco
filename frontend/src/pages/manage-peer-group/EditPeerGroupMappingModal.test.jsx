import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditPeerGroupMappingModal from "./EditPeerGroupMappingModal";
import { api, store } from "../../lib";
import { message } from "antd";

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

jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const mockPeerGroup = {
  id: 1,
  name: "Trader / Processor",
  code: "trader_processor",
  description: "Cocoa bean traders and processors.",
  member_types: [
    { id: 101, name: "Trader" },
    { id: 102, name: "Processor" },
  ],
};

describe("EditPeerGroupMappingModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    store.update((s) => {
      s.optionValues = {
        member_type: [
          { id: 101, name: "Trader" },
          { id: 102, name: "Processor" },
          { id: 103, name: "Chocolate Brand" },
          { id: 104, name: "Retailer" },
          { id: 999, name: "All" }, // Should be filtered out
        ],
      };
    });
  });

  test("renders modal with correct title, instructions, and buttons when visible", () => {
    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(
      screen.getByText("Edit Member Types: Trader / Processor")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Select which member type tags should map to this harmonized cohort/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select All/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear All/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Mappings/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("calls onClose when Cancel button is clicked", () => {
    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test("successfully submits mappings and calls onSuccess and onClose", async () => {
    const putSpy = jest.spyOn(api, "put").mockResolvedValueOnce({
      data: { success: true },
    });

    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const saveButton = screen.getByRole("button", { name: /Save Mappings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith("/peer_group/1/mappings", {
        member_type_ids: [101, 102],
      });
      expect(message.success).toHaveBeenCalledWith(
        "Successfully updated mappings for Trader / Processor"
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    putSpy.mockRestore();
  });

  test("handles Select All and Clear All button interactions", async () => {
    const putSpy = jest.spyOn(api, "put").mockResolvedValueOnce({
      data: { success: true },
    });

    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Click Select All
    const selectAllBtn = screen.getByRole("button", { name: /Select All/i });
    fireEvent.click(selectAllBtn);

    const saveButton = screen.getByRole("button", { name: /Save Mappings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith("/peer_group/1/mappings", {
        member_type_ids: [101, 102, 103, 104], // All except 'All'
      });
    });

    putSpy.mockRestore();
  });

  test("handles Clear All button interaction", async () => {
    const putSpy = jest.spyOn(api, "put").mockResolvedValueOnce({
      data: { success: true },
    });

    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Click Clear All
    const clearAllBtn = screen.getByRole("button", { name: /Clear All/i });
    fireEvent.click(clearAllBtn);

    const saveButton = screen.getByRole("button", { name: /Save Mappings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith("/peer_group/1/mappings", {
        member_type_ids: [],
      });
    });

    putSpy.mockRestore();
  });

  test("handles API error with custom detail message on save failure", async () => {
    const putSpy = jest.spyOn(api, "put").mockRejectedValueOnce({
      response: {
        data: {
          detail: "Member type already assigned to another peer group",
        },
      },
    });

    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const saveButton = screen.getByRole("button", { name: /Save Mappings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith(
        "Member type already assigned to another peer group"
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    putSpy.mockRestore();
  });

  test("handles API error with generic fallback message when detail is missing", async () => {
    const putSpy = jest
      .spyOn(api, "put")
      .mockRejectedValueOnce(new Error("Network Error"));

    render(
      <EditPeerGroupMappingModal
        visible={true}
        peerGroup={mockPeerGroup}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const saveButton = screen.getByRole("button", { name: /Save Mappings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith(
        "Failed to update peer group mappings"
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    putSpy.mockRestore();
  });
});
