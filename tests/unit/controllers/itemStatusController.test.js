vi.mock("../../../src/services/notificationService.js", () => ({ notifyMessageRecipients: vi.fn(), notifyModeration: vi.fn(), notifyReportChange: vi.fn(), notifyAdminsOfPendingReport: vi.fn() }));
import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifyModeration, notifyReportChange } from "../../../src/services/notificationService.js";

const mockItem = vi.hoisted(() => {
  const Item = vi.fn();
  Item.findById = vi.fn();
  Item.find = vi.fn();
  Item.updateOne = vi.fn().mockResolvedValue({ acknowledged: true, matchedCount: 1, modifiedCount: 1 });
  return Item;
});
vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/utils/emailService.js", () => ({ sendContactOwnerEmail: vi.fn() }));
vi.mock("qrcode", () => ({ default: { toFile: vi.fn() } }));

const { createItem, getItems, getItemById, updateItemStatus, updateItem, deleteItem } =
  await import("../../../src/controllers/ItemController.js");

const response = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });
const body = (type) => ({
  title: "Black wallet",
  description: "A black wallet with a student card inside.",
  category: "Accessories",
  type,
  location: "Universiti Malaya (UM)",
  date: "2026-08-12",
  user: "Test User",
  images: [],
  reportLocation: { type: "Point", coordinates: [101.65, 3.12], formattedAddress: "UM" },
});

describe("item status controller behavior", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["Matched", "Returned"])("notifies when an admin marks an approved report %s", async (status) => {
    const item = { _id: "item-1", reportedBy: "owner", status: "Approved" };
    mockItem.findById.mockResolvedValue(item);
    const res = response();
    await updateItemStatus({ params: { itemId: "item-1" }, body: { status }, user: { id: "admin", role: "admin" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(notifyModeration).toHaveBeenCalledWith(undefined, item, "Approved");
  });

  it.each(["edit", "delete"])("notifies for an admin %s after persistence, but not an owner action", async (action) => {
    for (const role of ["admin", "user"]) {
      vi.clearAllMocks();
      const item = { _id: "item-1", reportedBy: "owner", title: "Wallet", status: role === "user" && action === "edit" ? "Pending" : "Approved" };
      item.save = vi.fn().mockResolvedValue(item);
      item.deleteOne = vi.fn().mockResolvedValue({});
      mockItem.findById.mockResolvedValue(item);
      const res = response();
      const req = { params: { itemId: "item-1" }, body: { title: "Updated wallet" }, user: { id: role === "admin" ? "admin" : "owner", role } };
      await (action === "edit" ? updateItem : deleteItem)(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      if (role === "admin") {
        expect(notifyReportChange).toHaveBeenCalledWith(undefined, item, action === "edit" ? "edited" : "deleted", ...(action === "edit" ? ["Approved"] : []));
        expect((action === "edit" ? item.save : item.deleteOne).mock.invocationCallOrder[0]).toBeLessThan(notifyReportChange.mock.invocationCallOrder[0]);
      } else expect(notifyReportChange).not.toHaveBeenCalled();
    }
  });

  it.each(["edit", "delete"])("does not notify when %s persistence fails", async (action) => {
    const item = { reportedBy: "owner", status: "Approved", save: vi.fn().mockRejectedValue(new Error("Database failed")), deleteOne: vi.fn().mockRejectedValue(new Error("Database failed")) };
    mockItem.findById.mockResolvedValue(item);
    const res = response();
    await (action === "edit" ? updateItem : deleteItem)({ params: { itemId: "item-1" }, body: {}, user: { id: "admin", role: "admin" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(notifyReportChange).not.toHaveBeenCalled();
  });

  // Tests that lost and found posts receive the expected initial status.
  it.each(["Lost", "Found"])("assigns %s to a newly submitted post", async (type) => {
    const saved = { _id: "item-1", type, status: "Pending", ...body(type) };
    const save = vi.fn().mockResolvedValue(saved);
    // The controller saves once before and once after generating the QR code.
    saved.save = save;
    mockItem.mockImplementationOnce(() => ({ save }));
    const res = response();
    await createItem({ user: { id: "user-1" }, body: body(type) }, res);
    // New posts are assigned the backend moderation status.
    expect(mockItem).toHaveBeenCalledWith(expect.objectContaining({ type, status: "Pending" }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Tests that the item list returns the status saved for each item.
  it("returns each item's persisted status in the list response", async () => {
    const items = [{ _id: "item-1", type: "Lost", status: "Lost" }];
    const query = { populate: vi.fn().mockReturnThis(), sort: vi.fn().mockResolvedValue(items) };
    mockItem.find.mockReturnValue(query);
    const res = response();
    await getItems({ query: { type: "Lost" }, user: { role: "user" } }, res);
    expect(res.json).toHaveBeenCalledWith({ count: 1, data: items });
  });

  // Tests that the item details endpoint returns the saved status.
  it("returns the persisted status on the item details response", async () => {
    const item = { _id: "item-1", type: "Found", status: "Approved" };
    mockItem.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(item) });
    const res = response();
    await getItemById({ params: { itemId: "item-1" }, user: {} }, res);
    expect(res.json).toHaveBeenCalledWith({ data: item, isOwner: false });
  });

  // Tests that an authorised user can save an item status update.
  it("persists a status update", async () => {
    const item = { status: "Pending", reportedBy: "user-1", save: vi.fn().mockResolvedValue({ status: "Approved" }) };
    mockItem.findById.mockResolvedValue(item);
    const res = response();
    await updateItemStatus({ params: { itemId: "item-1" }, body: { status: "Approved" }, user: { id: "admin-1", role: "admin" } }, res);
    expect(item.status).toBe("Approved");
    expect(mockItem.updateOne).toHaveBeenCalledOnce();
    expect(mockItem.updateOne).toHaveBeenCalledWith(
      { _id: "item-1" }, { $set: { status: "Approved" } }, { runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(notifyModeration).toHaveBeenCalledWith(undefined, item, "Pending");
  });

  // Reject statuses outside the controller's allowed status list.
  it("rejects an invalid item status", async () => {
    const res = response();

    await updateItemStatus(
      { params: { itemId: "item-1" }, body: { status: "Unknown" }, user: { id: "admin-1", role: "admin" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockItem.findById).not.toHaveBeenCalled();
  });

  // Prevent users who do not own an item from changing its status.
  it("rejects a status update from a non-owner", async () => {
    const item = { status: "Pending", reportedBy: "owner-1", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);
    const res = response();

    await updateItemStatus(
      { params: { itemId: "item-1" }, body: { status: "Matched" }, user: { id: "other-user", role: "user" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(item.save).not.toHaveBeenCalled();
    expect(mockItem.updateOne).not.toHaveBeenCalled();
  });

  // Ensure Lost and Found cannot be used as moderation updates by an owner.
  it.each(["Lost", "Found"])("rejects owner updates to the %s status", async (status) => {
    const item = { status: "Approved", reportedBy: "user-1", save: vi.fn() };
    mockItem.findById.mockResolvedValue(item);
    const res = response();

    await updateItemStatus(
      { params: { itemId: "item-1" }, body: { status }, user: { id: "user-1", role: "user" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(item.save).not.toHaveBeenCalled();
    expect(mockItem.updateOne).not.toHaveBeenCalled();
  });
});
