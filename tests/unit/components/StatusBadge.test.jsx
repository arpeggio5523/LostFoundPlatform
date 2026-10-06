import { describe, it, expect } from "vitest";
import React from "react";

// Provide React globally for dependencies.
globalThis.React = React;
const { default: StatusBadge } = await import("../../../src/components/StatusBadge.jsx");

describe("StatusBadge component", () => {
  // Checks that the Lost status is shown to the user.
  it("renders a Lost status label", () => {
    const badge = StatusBadge({ status: "Lost" });
    expect(badge.props.children).toBe("Lost");
  });

  // Checks that the Found status is shown to the user.
  it("renders a Found status label", () => {
    const badge = StatusBadge({ status: "Found" });
    expect(badge.props.children).toBe("Found");
  });

  // Checks that the component still renders when no status is supplied.
  it("renders an empty label when status is missing", () => {
    const badge = StatusBadge({});
    expect(badge.type).toBe("span");
    expect(badge.props.children).toBeUndefined();
  });
});
