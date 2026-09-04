import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { mockItem, authenticatedUser } = vi.hoisted(() => ({
  mockItem: { findById: vi.fn() },
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

describe("DELETE /api/items/:itemId - admin delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authenticatedUser.current = { id: "admin-1", role: "Admin" };
  });

  it("allows an admin to delete another user's post", async () => {
    const item = { _id: "item-delete-1", reportedBy: "user-1", deleteOne: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).delete("/api/items/item-delete-1");

    expect(response.status).toBe(200);
    expect(mockItem.findById).toHaveBeenCalledWith("item-delete-1");
    expect(item.deleteOne).toHaveBeenCalledOnce();
    expect(response.body).toEqual({ message: "Item deleted successfully." });
  });

  it("returns 404 when the post does not exist", async () => {
    mockItem.findById.mockResolvedValue(null);

    const response = await request(app).delete("/api/items/missing-item");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Item not found." });
  });

  it("prevents a non-admin non-owner from deleting the post", async () => {
    authenticatedUser.current = { id: "another-user", role: "User" };
    const item = { reportedBy: "owner-1", deleteOne: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).delete("/api/items/item-delete-1");

    expect(response.status).toBe(403);
    expect(item.deleteOne).not.toHaveBeenCalled();
    expect(response.body).toEqual({ error: "You do not have permission to delete this item." });
  });

  it("returns 500 when deleting the post fails", async () => {
    const item = {
      reportedBy: "user-1",
      deleteOne: vi.fn().mockRejectedValue(new Error("Database delete failed")),
    };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).delete("/api/items/item-delete-1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database delete failed" });
  });
});
