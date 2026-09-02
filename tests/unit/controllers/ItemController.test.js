import { beforeEach, describe, expect, it, vi } from "vitest";

const saveMock = vi.fn();

vi.mock("../../../src/models/Item.js", () => ({
  default: vi.fn(function Item(payload) {
    Object.assign(this, payload);
    this._id = "generated-item-id";
    this.save = saveMock.mockResolvedValue(this);
  }),
}));

vi.mock("qrcode", () => ({
  default: {
    toFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock("../../../src/utils/emailService.js", () => ({
  sendContactOwnerEmail: vi.fn(),
}));

const { createItem } = await import("../../../src/controllers/ItemController.js");
const Item = (await import("../../../src/models/Item.js")).default;
const QRCode = (await import("qrcode")).default;
const fs = (await import("fs")).default;

describe("ItemController QR generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveMock.mockClear();
    saveMock.mockResolvedValue(undefined);
    fs.existsSync.mockReturnValue(false);
    process.env.FRONTEND_URL = "https://lostfound.example.com";
  });

  it("generates and stores a QR code path when creating an item", async () => {
    const req = {
      user: {
        id: "user-123",
      },
      body: {
        title: "Found Keys",
        description: "Two silver keys found near the cafeteria.",
        category: "Keys",
        type: "Found",
        location: "Universiti Malaya (UM)",
        date: "2026-08-30",
        user: "John Doe",
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await createItem(req, res);

    expect(Item).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Found Keys",
        reportedBy: "user-123",
        status: "Pending",
      })
    );

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("uploads/qrcodes"),
      { recursive: true }
    );

    expect(QRCode.toFile).toHaveBeenCalledWith(
      expect.stringContaining("qr-generated-item-id.png"),
      "https://lostfound.example.com/item/generated-item-id"
    );

    const savedItem = res.json.mock.calls[0][0].data;

    expect(savedItem.qrCodePath).toBe(
      "/uploads/qrcodes/qr-generated-item-id.png"
    );

    expect(saveMock).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
