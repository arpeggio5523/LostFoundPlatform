import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { mockItem, authenticatedUser } = vi.hoisted(() => ({
  mockItem: { findById: vi.fn(), updateOne: vi.fn().mockResolvedValue({ acknowledged: true, matchedCount: 1, modifiedCount: 1 }) },
  authenticatedUser: { current: { id: "admin-1", role: "Admin" } },
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

describe("PUT /api/items/:itemId/status - admin reject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authenticatedUser.current = { id: "admin-1", role: "Admin" };
  });

  it("allows an admin to reject a pending item", async () => {
    const item = {
      _id: "item-reject-1",
      reportedBy: "user-1",
      status: "Pending",
      save: vi.fn().mockImplementation(function save() {
        return Promise.resolve({ _id: this._id, status: this.status });
      }),
    };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app)
      .put("/api/items/item-reject-1/status")
      .send({ status: "Rejected" });

    expect(response.status).toBe(200);
    expect(mockItem.findById).toHaveBeenCalledWith("item-reject-1");
    expect(mockItem.updateOne).toHaveBeenCalledOnce();
    expect(mockItem.updateOne).toHaveBeenCalledWith(
      { _id: "item-reject-1" }, { $set: { status: "Rejected" } }, { runValidators: true }
    );
    expect(response.body).toMatchObject({
      message: "Item status updated",
      data: { _id: "item-reject-1", status: "Rejected" },
    });
  });

  it("returns 404 when the item to reject does not exist", async () => {
    mockItem.findById.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/items/missing-item/status")
      .send({ status: "Rejected" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Item not found." });
    expect(mockItem.updateOne).not.toHaveBeenCalled();
  });

  it("prevents a non-admin non-owner from rejecting an item", async () => {
    authenticatedUser.current = { id: "another-user", role: "User" };
    const item = { reportedBy: "owner-1", status: "Pending", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app)
      .put("/api/items/item-reject-1/status")
      .send({ status: "Rejected" });

    expect(response.status).toBe(403);
    expect(item.save).not.toHaveBeenCalled();
    expect(mockItem.updateOne).not.toHaveBeenCalled();
  });
});
