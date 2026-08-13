import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/models/Item.js", () => {
  return {
    default: class MockItem {
      constructor(payload) {
        this.payload = payload;
      }

      async save() {
        return this.payload;
      }
    },
  };
});

const { createItem } = await import("../src/controllers/ItemController.js");

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves latitude, longitude and location name into reportLocation", async () => {
    const req = {
      user: { id: "user-123" },
      body: {
        title: "Black wallet",
        description: "Lost black wallet near lecture hall",
        category: "Accessories",
        type: "Lost",
        location: "Universiti Malaya (UM)",
        date: "2026-08-12",
        user: "Alice",
        latitude: 3.1191,
        longitude: 101.654,
        locationName: "Faculty of Engineering, UM",
        images: [],
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await createItem(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Lost item report submitted successfully.",
      })
    );

    const savedData = res.json.mock.calls[0][0].data;
    expect(savedData.reportLocation.coordinates).toEqual([101.654, 3.1191]);
    expect(savedData.reportLocation.formattedAddress).toBe("Faculty of Engineering, UM");
  });
});
