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

describe("PUT /api/items/:itemId - admin edit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authenticatedUser.current = { id: "admin-1", role: "Admin" };
  });

  it("allows an admin to edit another user's post and its status", async () => {
    const item = {
      _id: "item-edit-1",
      reportedBy: "user-1",
      title: "Original title",
      description: "Original description",
      status: "Pending",
      save: vi.fn().mockImplementation(function save() {
        return Promise.resolve({ _id: this._id, title: this.title, description: this.description, status: this.status });
      }),
    };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app)
      .put("/api/items/item-edit-1")
      .send({ title: "Edited title", description: "Edited description", status: "Approved" });

    expect(response.status).toBe(200);
    expect(item.save).toHaveBeenCalledOnce();
    expect(response.body).toMatchObject({
      message: "Item updated.",
      data: { title: "Edited title", description: "Edited description", status: "Approved" },
    });
  });

  it("returns 404 when the post does not exist", async () => {
    mockItem.findById.mockResolvedValue(null);

    const response = await request(app).put("/api/items/missing-item").send({ title: "Edit" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Item not found." });
  });

  it("prevents a non-admin non-owner from editing the post", async () => {
    authenticatedUser.current = { id: "another-user", role: "User" };
    const item = { reportedBy: "owner-1", title: "Original", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).put("/api/items/item-edit-1").send({ title: "Unauthorized edit" });

    expect(response.status).toBe(403);
    expect(item.save).not.toHaveBeenCalled();
  });

  it("rejects an invalid status supplied by an admin", async () => {
    const item = { reportedBy: "user-1", status: "Pending", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).put("/api/items/item-edit-1").send({ status: "Archived" });

    expect(response.status).toBe(400);
    expect(item.save).not.toHaveBeenCalled();
    expect(response.body.error).toMatch(/Invalid status/);
  });

  it("returns 500 when saving the edit fails", async () => {
    const item = {
      reportedBy: "user-1",
      title: "Original",
      save: vi.fn().mockRejectedValue(new Error("Database update failed")),
    };
    mockItem.findById.mockResolvedValue(item);

    const response = await request(app).put("/api/items/item-edit-1").send({ title: "Edited" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database update failed" });
  });
});
