import { afterEach, describe, it, expect } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { LanguageProvider } from "../../../src/context/LanguageContext";
import { LANGUAGE_STORAGE_KEY } from "../../../src/i18n/translations";

// Provide React globally for dependencies.
globalThis.React = React;
const { default: StatusBadge } = await import("../../../src/components/StatusBadge.jsx");

afterEach(() => {
  cleanup();
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
});

describe("StatusBadge component", () => {
  // Checks that the Lost status is shown to the user.
  it("renders a Lost status label", () => {
    render(<StatusBadge status="Lost" />);
    expect(screen.getByText("Lost")).toBeInTheDocument();
  });

  // Checks that the Found status is shown to the user.
  it("renders a Found status label", () => {
    render(<StatusBadge status="Found" />);
    expect(screen.getByText("Found")).toBeInTheDocument();
  });

  // Checks that the component still renders when no status is supplied.
  it("renders an empty label when status is missing", () => {
    const { container } = render(<StatusBadge />);
    expect(container.querySelector("span")).toBeEmptyDOMElement();
  });

  it("translates the status label while preserving its original colour", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "zh");
    render(<LanguageProvider><StatusBadge status="Lost" /></LanguageProvider>);
    expect(screen.getByText("遗失")).toHaveClass("bg-orange-100");
  });
});
