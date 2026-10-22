import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

const { mapMock, markerMock, geolocateMock } = vi.hoisted(() => {
  const mapMock = {
    addControl: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 101.6869, lat: 3.139 })),
    flyTo: vi.fn(),
  };
  const markerMock = {
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn(),
    getLngLat: vi.fn(() => ({ lng: 101.7, lat: 3.2 })),
  };
  const geolocateMock = { on: vi.fn() };
  return { mapMock, markerMock, geolocateMock };
});

vi.mock("mapbox-gl", () => ({
  default: {
    accessToken: "test-mapbox-token",
    Map: vi.fn(function Map() { return mapMock; }),
    Marker: vi.fn(function Marker() { return markerMock; }),
    NavigationControl: vi.fn(function NavigationControl() { return {}; }),
    GeolocateControl: vi.fn(function GeolocateControl() { return geolocateMock; }),
  },
}));

import LocationPicker from "../../../src/components/Locationpicker.jsx";

// This component uses the classic JSX transform in the Vitest configuration.
globalThis.React = React;

const suggestions = [{
  mapbox_id: "place/123",
  name: "KLCC",
  full_address: "Kuala Lumpur City Centre, Kuala Lumpur",
  place_formatted: "Kuala Lumpur",
}];

function jsonResponse(body) {
  return Promise.resolve({ json: () => Promise.resolve(body) });
}

async function advanceDebounce(ms = 300) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("LocationPicker place search", () => {
  let fetchMock;
  let uuidMock;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    uuidMock = vi.fn().mockReturnValueOnce("search-session-1").mockReturnValue("search-session-next");
    vi.stubGlobal("crypto", { ...crypto, randomUUID: uuidMock });
    mapMock.getCenter.mockReturnValue({ lng: 101.6869, lat: 3.139 });
    mapMock.flyTo.mockClear();
    mapMock.remove.mockClear();
    mapMock.on.mockClear();
    markerMock.setLngLat.mockClear();
    markerMock.addTo.mockClear();
    markerMock.on.mockClear();
    geolocateMock.on.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("debounces search, limits it to Malaysia, and lists returned suggestions", async () => {
    fetchMock.mockReturnValue(jsonResponse({ suggestions }));
    render(<LocationPicker onConfirm={vi.fn()} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search a place, building or address...");

    fireEvent.change(input, { target: { value: "k" } });
    fireEvent.change(input, { target: { value: " KLCC " } });
    await advanceDebounce(299);
    expect(fetchMock).not.toHaveBeenCalled();

    await advanceDebounce(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("/search/searchbox/v1/suggest?");
    expect(url).toContain("q=KLCC");
    expect(url).toContain("country=my");
    expect(url).toContain("limit=8");
    expect(url).toContain("proximity=101.6869,3.139");
    expect(url).toContain("session_token=search-session-1");
    expect(screen.getByText("KLCC")).toBeInTheDocument();
    expect(screen.getByText("Kuala Lumpur City Centre, Kuala Lumpur")).toBeInTheDocument();
  });

  it("does not search for a one-character query and shows an empty state for no matches", async () => {
    fetchMock.mockReturnValue(jsonResponse({ suggestions: [] }));
    render(<LocationPicker onConfirm={vi.fn()} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search a place, building or address...");
    fireEvent.change(input, { target: { value: "K" } });
    await advanceDebounce(500);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "KL" } });
    await advanceDebounce();
    expect(screen.getByText("No places found")).toBeInTheDocument();
  });

  it("retrieves a selected place, moves the pin, and confirms its coordinates and address", async () => {
    fetchMock
      .mockReturnValueOnce(jsonResponse({ suggestions }))
      .mockReturnValueOnce(jsonResponse({
        features: [{
          geometry: { coordinates: [101.71, 3.15] },
          properties: { name: "KLCC", place_formatted: "Kuala Lumpur", full_address: "KLCC, Kuala Lumpur" },
        }],
      }));
    const onConfirm = vi.fn();
    render(<LocationPicker onConfirm={onConfirm} onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search a place, building or address..."), { target: { value: "KLCC" } });
    await advanceDebounce();
    fireEvent.mouseDown(screen.getByText("KLCC"));

    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("/retrieve/place%2F123?");
    expect(fetchMock.mock.calls[1][0]).toContain("session_token=search-session-1");
    expect(screen.getByText("KLCC, Kuala Lumpur")).toBeInTheDocument();
    expect(markerMock.setLngLat).toHaveBeenCalledWith([101.71, 3.15]);
    expect(mapMock.flyTo).toHaveBeenCalledWith({ center: [101.71, 3.15], zoom: 17 });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Location" }));
    expect(onConfirm).toHaveBeenCalledWith({
      type: "Point",
      coordinates: [101.71, 3.15],
      formattedAddress: "KLCC, Kuala Lumpur",
    });
  });

  it("uses the place name when the retrieved feature has no full address", async () => {
    fetchMock
      .mockReturnValueOnce(jsonResponse({ suggestions }))
      .mockReturnValueOnce(jsonResponse({ features: [{
        geometry: { coordinates: [101.71, 3.15] },
        properties: { name: "KLCC", place_formatted: "Kuala Lumpur" },
      }] }));
    render(<LocationPicker onConfirm={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search a place, building or address..."), { target: { value: "KLCC" } });
    await advanceDebounce();
    fireEvent.mouseDown(screen.getByText("KLCC"));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByText("KLCC, Kuala Lumpur")).toBeInTheDocument();
  });

  it("handles suggestion request failures", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<LocationPicker onConfirm={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search a place, building or address..."), { target: { value: "KLCC" } });
    await advanceDebounce();
    expect(screen.getByText("No places found")).toBeInTheDocument();
  });

  it("keeps confirmation disabled until a location is selected and closes on cancel", () => {
    const onClose = vi.fn();
    render(<LocationPicker onConfirm={vi.fn()} onClose={onClose} />);
    expect(screen.getByRole("button", { name: "Confirm Location" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
