import { beforeEach, expect, it, vi } from "vitest";
import { canEditItem, setAuthUser } from "../../../src/services/authState.js";

vi.mock("../../../src/models/Item.js", () => ({ default: { findById: vi.fn() } }));
vi.mock("../../../src/services/notificationService.js", () => ({ notifyModeration: vi.fn(), notifyReportChange: vi.fn(), notifyAdminsOfPendingReport: vi.fn() }));
import Item from "../../../src/models/Item.js";
import { updateItem, getItemById } from "../../../src/controllers/ItemController.js";

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

it.each(['owner', 'other-user'])('returns ownership for the authenticated viewer %s', async (viewerId) => {
  const item = { reportedBy: { _id: 'owner' }, status: 'Approved', user: 'Anonymous' };
  Item.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(item) });
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  await getItemById({ params: { itemId: 'item-1' }, user: { id: viewerId } }, res);
  expect(res.json).toHaveBeenCalledWith({ data: item, isOwner: viewerId === 'owner' });
});

it.each(["Pending", "Approved", "Rejected", "Matched", "Returned"])("enforces owner edit permission for %s", async (status) => {
  const item = { reportedBy: "owner", status, title: "Original", save: vi.fn() };
  item.save.mockResolvedValue(item);
  Item.findById.mockResolvedValue(item);
  setAuthUser({ id: "owner", role: "user" }, "token");
  expect(canEditItem(item)).toBe(status === "Pending");
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  await updateItem({ params: { itemId: "item-1" }, body: { title: "Updated" }, user: { id: "owner", role: "user" } }, res);
  expect(res.status).toHaveBeenCalledWith(status === "Pending" ? 200 : 403);
  expect(item.save).toHaveBeenCalledTimes(status === "Pending" ? 1 : 0);
  expect(item.title).toBe(status === "Pending" ? "Updated" : "Original");
});
