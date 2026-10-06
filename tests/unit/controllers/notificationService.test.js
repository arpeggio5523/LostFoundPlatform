vi.mock("../../../src/models/Notification.js");
import Notification from "../../../src/models/Notification.js";
import { notifyMessageRecipients, notifyModeration } from "../../../src/services/notificationService.js";

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

test.each(["Approved", "Rejected"])("notifies report owner of %s decision", async (status) => {
  await notifyModeration(null, { _id: "item", reportedBy: "owner", title: "Wallet", status }, "Pending");
  expect(Notification.create.mock.calls[0][0]).toMatchObject({ recipient: "owner", type: status.toLowerCase(), item: "item" });
});

test("does not notify for unchanged decisions or lifecycle updates", async () => {
  await notifyModeration(null, { status: "Approved" }, "Approved");
  await notifyModeration(null, { status: "Returned" }, "Approved");
  expect(Notification.create).not.toHaveBeenCalled();
});
