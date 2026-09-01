import { describe, it, expect, vi, beforeEach } from "vitest";

const mockItem = vi.hoisted(() => {
  const Item = vi.fn();
  Item.findById = vi.fn();
  return Item;
});
vi.mock("../../../src/models/Item.js", () => ({ default: mockItem }));
vi.mock("../../../src/models/User.js", () => ({ default: {} }));
vi.mock("../../../src/utils/emailService.js", () => ({ sendContactOwnerEmail: vi.fn() }));
vi.mock("qrcode", () => ({ default: { toFile: vi.fn() } }));

const { createItem, updateItem } = await import("../../../src/controllers/ItemController.js");
const response = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });
const location = { type: "Point", coordinates: [101.65, 3.12], formattedAddress: "Library area" };
const body = { title: "Black wallet", description: "A black wallet with a student card inside.", category: "Accessories", type: "Lost", location: "Universiti Malaya (UM)", date: "2026-08-12", user: "Test User", images: [], reportLocation: location };

describe("location tag controller behavior", () => {
  beforeEach(() => vi.clearAllMocks());

  // Checks that a selected map location is included when a report is created.
  it("saves the location tag on a new report", async () => {
    const saved = { _id: "item-1", save: vi.fn() };
    saved.save.mockResolvedValue(saved);
    mockItem.mockImplementationOnce((payload) => ({ ...saved, ...payload, save: saved.save }));
    const res = response();
    await createItem({ user: { id: "user-1" }, body }, res);
    expect(mockItem).toHaveBeenCalledWith(expect.objectContaining({ reportLocation: location }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Checks that submitting without a map location is rejected.
  it("rejects a report without a location tag", async () => {
    const res = response();
    await createItem({ user: { id: "user-1" }, body: { ...body, reportLocation: undefined } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ missingFields: expect.arrayContaining(["reportLocation"]) }));
  });

  // Checks that an existing report can be updated with a new map location.
  it("updates the location tag on an existing report", async () => {
    // The controller references an optional legacy user value while updating.
    globalThis.user = undefined;
    const item = { reportedBy: "user-1", save: vi.fn().mockResolvedValue({ reportLocation: location }) };
    mockItem.findById.mockResolvedValue(item);
    const res = response();
    await updateItem({ params: { itemId: "item-1" }, user: { id: "user-1", role: "user" }, body: { reportLocation: location } }, res);
    expect(item.reportLocation).toEqual(location);
    expect(item.save).toHaveBeenCalled();
  });
});
