import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { mockItem } = vi.hoisted(() => ({
  mockItem: { findById: vi.fn() },
}));

// Mock database and authentication dependencies for an isolated route test.
vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/services/jinaEmbedding.js", () => ({ generateImageEmbedding: vi.fn() }));
vi.mock("../../../src/middleware/authMiddleware.js", () => ({
  optionalAuth: (req, _res, next) => {
    req.user = { id: "user-1" };
    next();
  },
  requireAuth: (req, _res, next) => {
    req.user = { id: "user-1" };
    next();
  },
}));

const { default: itemRoutes } = await import("../../../src/routes/ItemRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/items", itemRoutes);

// Create a minimal item fixture with the requested status.
const itemWithStatus = (status) => ({
  _id: `${status.toLowerCase()}-item-1`,
  title: `${status} backpack`,
  type: status,
  status,
  reportedBy: "user-1",
});

describe("GET /api/items/:itemId - item status", () => {
  beforeEach(() => vi.clearAllMocks());

  // Confirm both user-visible item states are returned by the API.
  it.each(["Lost", "Found"])("returns the %s status for an item", async (status) => {
    const item = itemWithStatus(status);
    mockItem.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(item),
    });

    const response = await request(app).get(`/api/items/${item._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: item._id,
      type: status,
      status,
    });
  });
});
