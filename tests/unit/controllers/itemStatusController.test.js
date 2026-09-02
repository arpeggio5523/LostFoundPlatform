import { describe, it, expect, vi, beforeEach } from "vitest";

const mockItem = vi.hoisted(() => {
  const Item = vi.fn();
  Item.findById = vi.fn();
  Item.find = vi.fn();
  return Item;
});
vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/utils/emailService.js", () => ({ sendContactOwnerEmail: vi.fn() }));
vi.mock("qrcode", () => ({ default: { toFile: vi.fn() } }));

const { createItem, getItems, getItemById, updateItemStatus } =
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
    expect(res.json).toHaveBeenCalledWith({ data: item });
  });

  // Tests that an authorised user can save an item status update.
  it("persists a status update", async () => {
    const item = { status: "Pending", reportedBy: "user-1", save: vi.fn().mockResolvedValue({ status: "Approved" }) };
    mockItem.findById.mockResolvedValue(item);
    const res = response();
    await updateItemStatus({ params: { itemId: "item-1" }, body: { status: "Approved" }, user: { id: "admin-1", role: "admin" } }, res);
    expect(item.status).toBe("Approved");
    expect(item.save).toHaveBeenCalled();
  });
});
