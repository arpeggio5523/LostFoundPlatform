import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { mockItem } = vi.hoisted(() => ({
  mockItem: { findById: vi.fn() },
}));

vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/services/jinaEmbedding.js", () => ({ generateImageEmbedding: vi.fn() }));
vi.mock("../../../src/middleware/authMiddleware.js", () => ({
  optionalAuth: (req, _res, next) => next(),
  requireAuth: (req, _res, next) => {
    req.user = { id: "user-1", role: "User" };
    next();
  },
}));

const { default: itemRoutes } = await import("../../../src/routes/ItemRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/items", itemRoutes);

describe("PUT /api/items/:itemId - location tag", () => {
  beforeEach(() => vi.clearAllMocks());

  // A tagged location is stored as a GeoJSON point with its readable address.
  it("saves the location where an item was lost or found", async () => {
    const item = {
      _id: "item-location-1",
      reportedBy: "user-1",
      save: vi.fn().mockImplementation(function save() { return Promise.resolve(this); }),
    };
    mockItem.findById.mockResolvedValue(item);

    const reportLocation = {
      type: "Point",
      coordinates: [101.6869, 3.139],
      formattedAddress: "Kuala Lumpur City Centre",
    };
    const response = await request(app)
      .put(`/api/items/${item._id}`)
      .send({ reportLocation });

    expect(response.status).toBe(200);
    expect(item.reportLocation).toEqual(reportLocation);
    expect(response.body.data.reportLocation).toEqual(reportLocation);
    expect(item.save).toHaveBeenCalledOnce();
  });

  // Invalid coordinates must not be saved as a location tag.
  it("rejects an invalid location tag", async () => {
    const item = { _id: "item-location-2", reportedBy: "user-1", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app)
      .put(`/api/items/${item._id}`)
      .send({ reportLocation: { type: "Point", coordinates: [300, 3.139] } });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid or missing reportLocation.");
    expect(item.save).not.toHaveBeenCalled();
  });
});
