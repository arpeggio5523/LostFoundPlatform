vi.mock("../../../src/models/Notification.js");
import Notification from "../../../src/models/Notification.js";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../../src/controllers/notificationController.js";
import { makeRes } from "../../utils/Mongoosemocks.js";

beforeEach(() => vi.clearAllMocks());

test("lists only the authenticated user's notifications with bounded pagination", async () => {
  const query = { sort: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) };
  Notification.find.mockReturnValue(query);
  Notification.countDocuments.mockResolvedValue(0);
  const res = makeRes();
  await getNotifications({ user: { id: "me" }, query: { limit: 1000 } }, res);
  expect(Notification.find).toHaveBeenCalledWith({ recipient: "me" });
  expect(query.limit).toHaveBeenCalledWith(100);
  expect(Notification.countDocuments).toHaveBeenCalledWith({ recipient: "me", readAt: null });
  expect(res.body.unreadCount).toBe(0);
});

test("cannot mark someone else's notification read", async () => {
  Notification.findOneAndUpdate.mockResolvedValue(null);
  const res = makeRes();
  await markNotificationRead({ user: { id: "me" }, params: { id: "507f1f77bcf86cd799439011" } }, res);
  expect(Notification.findOneAndUpdate.mock.calls[0][0]).toEqual({ _id: "507f1f77bcf86cd799439011", recipient: "me" });
  expect(res.status).toHaveBeenCalledWith(404);
});

test.each([
  ["unread", { readAt: null }],
  ["messages", { type: "message" }],
  ["moderation", { type: { $in: ["approved", "rejected", "edited", "deleted", "matched", "returned"] } }],
])("filters %s notifications before pagination and keeps the global unread count", async (filter, fields) => {
  const query = { sort: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) };
  Notification.find.mockReturnValue(query);
  Notification.countDocuments.mockResolvedValue(3);
  const res = makeRes();
  await getNotifications({ user: { id: "me" }, query: { filter, page: 2 } }, res);
  expect(Notification.find).toHaveBeenCalledWith({ recipient: "me", ...fields });
  expect(Notification.countDocuments).toHaveBeenNthCalledWith(1, { recipient: "me", ...fields });
  expect(Notification.countDocuments).toHaveBeenNthCalledWith(2, { recipient: "me", readAt: null });
  expect(query.skip).toHaveBeenCalledWith(25);
});

test("rejects malformed notification IDs", async () => {
  const res = makeRes();
  await markNotificationRead({ params: { id: "bad" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(Notification.findOneAndUpdate).not.toHaveBeenCalled();
});

test("mark all updates only the authenticated user's unread notifications", async () => {
  Notification.updateMany.mockResolvedValue({});
  const res = makeRes();
  await markAllNotificationsRead({ user: { id: "me" }, app: { get: () => null } }, res);
  expect(Notification.updateMany.mock.calls[0][0]).toEqual({ recipient: "me", readAt: null });
});
