import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModerationItemCard from "../../../src/components/ModerationItemCard";

const pendingItem = {
  id: "item-reject-1",
  title: "Unclear item post",
  description: "A post awaiting moderation.",
  type: "Found",
  status: "Pending",
  author: "Test User",
  location: "Universiti Malaya (UM)",
  date: "13/08/2026",
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

describe("ModerationItemCard - reject moderation", () => {
  it("shows Reject for a pending item", () => {
    renderCard();

    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("passes the item id to the reject handler without opening details", () => {
    const { onReject, onViewDetails } = renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(onReject).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledWith("item-reject-1");
    expect(onViewDetails).not.toHaveBeenCalled();
  });

  it("disables moderation actions and shows progress while rejecting", () => {
    renderCard({ moderationStatus: "Rejected" });

    expect(screen.getByRole("button", { name: "Rejecting..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("hides Reject after the item has been rejected", () => {
    render(
      <ModerationItemCard
        item={{ ...pendingItem, status: "Rejected" }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetails={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /reject/i })).not.toBeInTheDocument();
  });
});
