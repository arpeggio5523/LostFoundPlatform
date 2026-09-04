import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { mockItem, authenticatedUser } = vi.hoisted(() => ({
  mockItem: { findById: vi.fn() },
  authenticatedUser: { current: { id: "owner-1", role: "User" } },
}));

vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/utils/emailService.js", () => ({ sendContactOwnerEmail: vi.fn() }));
vi.mock("../../../src/services/jinaEmbedding.js", () => ({ generateImageEmbedding: vi.fn() }));
vi.mock("../../../src/middleware/authMiddleware.js", () => ({
  optionalAuth: (req, _res, next) => next(),
  requireAuth: (req, _res, next) => {
    req.user = authenticatedUser.current;
    next();
  },
}));

const { default: itemRoutes } = await import("../../../src/routes/ItemRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/items", itemRoutes);

describe("DELETE /api/items/:itemId - regular user ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authenticatedUser.current = { id: "owner-1", role: "User" };
  });

  it("allows a regular user to delete their own post", async () => {
    const item = { _id: "owner-item-1", reportedBy: "owner-1", deleteOne: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).delete("/api/items/owner-item-1");

    expect(response.status).toBe(200);
    expect(mockItem.findById).toHaveBeenCalledWith("owner-item-1");
    expect(item.deleteOne).toHaveBeenCalledOnce();
    expect(response.body).toEqual({ message: "Item deleted successfully." });
  });

  it("prevents a regular user from deleting another user's post", async () => {
    const item = { _id: "other-item-1", reportedBy: "other-owner", deleteOne: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).delete("/api/items/other-item-1");

    expect(response.status).toBe(403);
    expect(item.deleteOne).not.toHaveBeenCalled();
    expect(response.body).toEqual({ error: "You do not have permission to delete this item." });
  });

  it("returns 404 when the requested post does not exist", async () => {
    mockItem.findById.mockResolvedValue(null);

    const response = await request(app).delete("/api/items/missing-item");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Item not found." });
  });
});
