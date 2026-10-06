vi.mock("../../../src/models/Notification.js");
import Notification from "../../../src/models/Notification.js";
import { notifyMessageRecipients, notifyModeration, notifyReportChange } from "../../../src/services/notificationService.js";

beforeEach(() => {
  vi.clearAllMocks();
  Notification.create.mockImplementation(async (fields) => fields);
});

test("notifies recipients, excludes sender, and masks private names", async () => {
  const emit = vi.fn();
  const io = { to: vi.fn().mockReturnValue({ emit }) };
  await notifyMessageRecipients(io, { _id: "conversation", participants: ["sender", "recipient"] }, { _id: "sender", fullName: "Secret Name", privacyMode: true });
  expect(Notification.create).toHaveBeenCalledTimes(1);
  expect(Notification.create.mock.calls[0][0]).toMatchObject({ recipient: "recipient", body: "Anonymous sent you a message.", type: "message", conversation: "conversation" });
  expect(io.to).toHaveBeenCalledWith("recipient");
  expect(emit).toHaveBeenCalledWith("notification_received", expect.any(Object));
});

test.each(["Approved", "Rejected", "Matched", "Returned"])("notifies report owner of %s decision", async (status) => {
  await notifyModeration(null, { _id: "item", reportedBy: "owner", title: "Wallet", status }, "Pending");
  expect(Notification.create.mock.calls[0][0]).toMatchObject({ recipient: "owner", type: status.toLowerCase(), item: "item" });
});

test("does not notify for unchanged decisions or pending status", async () => {
  await notifyModeration(null, { status: "Approved" }, "Approved");
  await notifyModeration(null, { status: "Pending" }, "Approved");
  expect(Notification.create).not.toHaveBeenCalled();
});

test.each(["edited", "deleted"])("notifies the owner when an admin has %s a report", async (action) => {
  await notifyReportChange(null, { _id: "item", reportedBy: { _id: "owner" }, title: "Wallet", status: "Approved" }, action, "Approved");
  expect(Notification.create).toHaveBeenCalledTimes(1);
  expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({
    recipient: "owner", type: action, body: `Your report "Wallet" was ${action} by an administrator.`,
  }));
  if (action === "deleted") expect(Notification.create.mock.calls[0][0]).not.toHaveProperty("item");
  else expect(Notification.create.mock.calls[0][0].item).toBe("item");
});

test("an edit that changes status sends only the specific status notification", async () => {
  await notifyReportChange(null, { _id: "item", reportedBy: "owner", title: "Wallet", status: "Returned" }, "edited", "Matched");
  expect(Notification.create).toHaveBeenCalledTimes(1);
  expect(Notification.create.mock.calls[0][0].type).toBe("returned");
});
