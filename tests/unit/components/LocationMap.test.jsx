import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// LocationMap uses the classic JSX transform and needs React available globally.
globalThis.React = React;
const { default: LocationMap } = await import("../../../src/components/LocationMap.jsx");

describe("LocationMap component", () => {
  // Checks that the map component explains when no location tag is available.
  it("shows the missing location message when no coordinates are supplied", () => {
    render(<LocationMap itemType="Lost" title="Black wallet" />);

    expect(screen.getByText(/No map location was provided/i)).toBeInTheDocument();
  });
});
