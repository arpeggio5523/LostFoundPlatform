import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModerationItemCard from "../../../src/components/ModerationItemCard";

const pendingItem = {
  id: "item-accept-1",
  title: "Black wallet",
  description: "A black wallet awaiting moderation.",
  type: "Lost",
  status: "Pending",
  author: "Test User",
  location: "Universiti Malaya (UM)",
  date: "12/08/2026",
};

const renderCard = (props = {}) => {
  const handlers = {
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onViewDetails: vi.fn(),
    ...props,
  };

  render(<ModerationItemCard item={pendingItem} {...handlers} />);
  return handlers;
};

describe("ModerationItemCard - accept moderation", () => {
  it("shows Approve for a pending item", () => {
    renderCard();

    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("passes the item id to the approve handler without opening details", () => {
    const { onApprove, onViewDetails } = renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(onApprove).toHaveBeenCalledOnce();
    expect(onApprove).toHaveBeenCalledWith("item-accept-1");
    expect(onViewDetails).not.toHaveBeenCalled();
  });

  it("disables moderation actions and shows progress while approving", () => {
    renderCard({ moderationStatus: "Approved" });

    expect(screen.getByRole("button", { name: "Approving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("hides Approve after the item has been approved", () => {
    render(
      <ModerationItemCard
        item={{ ...pendingItem, status: "Approved" }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetails={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /approv/i })).not.toBeInTheDocument();
  });
});
