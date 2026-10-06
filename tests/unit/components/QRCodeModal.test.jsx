import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QRCodeModal from "../../../src/components/QRcode";

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: React.forwardRef(({ value, title, className }, ref) => (
    <canvas
      ref={ref}
      data-testid="qr-canvas"
      data-value={value}
      title={title}
      className={className}
    />
  )),
}));

describe("QRCodeModal", () => {
  const item = {
    _id: "item 123",
    title: "Found Keys",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_PUBLIC_APP_URL", "https://lostfound.example.com/");

    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      configurable: true,
      value: vi.fn((callback) => {
        callback(new Blob(["qr"], { type: "image/png" }));
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not render when the modal is closed", () => {
    render(
      <QRCodeModal
        isOpen={false}
        onClose={vi.fn()}
        item={item}
      />
    );

    expect(
      screen.queryByRole("dialog")
    ).not.toBeInTheDocument();
  });

  it("generates a QR code for the item detail URL", () => {
    render(
      <QRCodeModal
        isOpen
        onClose={vi.fn()}
        item={item}
      />
    );

    expect(
      screen.getByRole("dialog", {
        name: /qr code/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: /qr code for found keys/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId("qr-canvas")).toHaveAttribute(
      "data-value",
      "https://lostfound.example.com/item/item%20123"
    );
  });

  it("shows a fallback when the item has no id", () => {
    render(
      <QRCodeModal
        isOpen
        onClose={vi.fn()}
        item={{ title: "Unknown Item" }}
      />
    );

    expect(
      screen.getByText("No QR code available")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /download/i,
      })
    ).not.toBeInTheDocument();
  });

  it("copies the item URL when native sharing is unavailable", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <QRCodeModal
        isOpen
        onClose={vi.fn()}
        item={item}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: /share/i,
      })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        "https://lostfound.example.com/item/item%20123"
      );
    });

    expect(
      screen.getByRole("button", {
        name: /link copied/i,
      })
    ).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <QRCodeModal
        isOpen
        onClose={onClose}
        item={item}
      />
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
