/**
 * unit/controllers/reportController.test.js
 *
 * Covers the message-report workflow:
 *  - reporters can only report the other participant of a conversation they belong to
 *  - input validation (category, description length, screenshot)
 *  - admins cannot be reported; duplicate pending reports are rejected
 *  - the evidence screenshot is encrypted at rest and only returned by the detail endpoint
 *  - removing a user flags the account, revokes sessions, settles all their pending reports
 *  - already-reviewed reports cannot be actioned twice
 */

vi.mock("../../../src/models/Conversation.js");
vi.mock("../../../src/models/Report.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    updateMany: vi.fn(),
  },
  REPORT_CATEGORIES: ["Harassment", "Spam", "Scam or Fraud", "Inappropriate Content", "Impersonation", "Other"],
}));
vi.mock("../../../src/models/User.js");
vi.mock("../../../src/utils/cryptoUtils.js");
vi.mock("../../../src/utils/authSession.js", () => ({ revokeAllUserSessions: vi.fn() }));

import Conversation from "../../../src/models/Conversation.js";
import Report from "../../../src/models/Report.js";
import User from "../../../src/models/User.js";
import { encrypt, decrypt } from "../../../src/utils/cryptoUtils.js";
import { revokeAllUserSessions } from "../../../src/utils/authSession.js";
import {
  createReport,
  getReport,
  listReports,
  rejectReport,
  removeReportedUser,
} from "../../../src/controllers/reportController.js";
import { makeQuery, makeRes } from "../../utils/Mongoosemocks.js";

const ME = "64f000000000000000000001";
const OTHER = "64f000000000000000000002";
const CONV = "64f0000000000000000000c1";
const REPORT_ID = "64f0000000000000000000d1";
const IMAGE = "data:image/png;base64,iVBORw0KGgo=";

const validBody = () => ({
  conversationId: CONV,
  category: "Harassment",
  description: "They keep sending abusive messages.",
  evidenceImage: IMAGE,
});

beforeEach(() => {
  vi.clearAllMocks();
  encrypt.mockImplementation((plain) => `enc:${plain}`);
  decrypt.mockImplementation((cipher) => cipher.replace(/^enc:/, ""));
  Conversation.findOne.mockResolvedValue({ _id: CONV, participants: [ME, OTHER] });
  User.findById.mockReturnValue(makeQuery({ _id: OTHER, role: "User" }));
  Report.findOne.mockResolvedValue(null);
  Report.create.mockResolvedValue({ _id: REPORT_ID, status: "Pending", category: "Harassment" });
});

describe("createReport", () => {
  test("creates a report against the other participant with encrypted evidence", async () => {
    const res = makeRes();
    await createReport({ user: { id: ME }, body: validBody() }, res);

    expect(res.statusCode).toBe(201);
    expect(Report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reporter: ME,
        reportedUser: OTHER,
        conversation: CONV,
        category: "Harassment",
        evidenceImage: `enc:${IMAGE}`,
      })
    );
  });

  test.each([
    ["an invalid conversation id", { conversationId: "nope" }],
    ["an unknown category", { category: "Rudeness" }],
    ["a too-short description", { description: "bad" }],
    ["a missing screenshot", { evidenceImage: undefined }],
    ["a non-image screenshot", { evidenceImage: "data:text/html;base64,AAAA" }],
  ])("400s for %s", async (_label, override) => {
    const res = makeRes();
    await createReport({ user: { id: ME }, body: { ...validBody(), ...override } }, res);

    expect(res.statusCode).toBe(400);
    expect(Report.create).not.toHaveBeenCalled();
  });

  test("404s when the reporter is not in the conversation", async () => {
    Conversation.findOne.mockResolvedValue(null);
    const res = makeRes();
    await createReport({ user: { id: ME }, body: validBody() }, res);

    expect(res.statusCode).toBe(404);
    expect(Report.create).not.toHaveBeenCalled();
  });

  test("refuses to report an administrator", async () => {
    User.findById.mockReturnValue(makeQuery({ _id: OTHER, role: "Admin" }));
    const res = makeRes();
    await createReport({ user: { id: ME }, body: validBody() }, res);

    expect(res.statusCode).toBe(403);
  });

  test("409s when a pending report against the same user already exists", async () => {
    Report.findOne.mockResolvedValue({ _id: "existing" });
    const res = makeRes();
    await createReport({ user: { id: ME }, body: validBody() }, res);

    expect(res.statusCode).toBe(409);
    expect(Report.create).not.toHaveBeenCalled();
  });
});

describe("listReports / getReport", () => {
  test("list omits the evidence image", async () => {
    const query = makeQuery([{ _id: REPORT_ID }]);
    Report.find.mockReturnValue(query);
    const res = makeRes();
    await listReports({ query: { status: "Pending" } }, res);

    expect(Report.find).toHaveBeenCalledWith({ status: "Pending" });
    expect(query.select).toHaveBeenCalledWith("-evidenceImage");
    expect(res.body.data).toHaveLength(1);
  });

  test("list rejects an unknown status filter", async () => {
    const res = makeRes();
    await listReports({ query: { status: "Bogus" } }, res);
    expect(res.statusCode).toBe(400);
  });

  test("detail decrypts the evidence image", async () => {
    Report.findById.mockReturnValue(makeQuery({ _id: REPORT_ID, evidenceImage: `enc:${IMAGE}` }));
    const res = makeRes();
    await getReport({ params: { id: REPORT_ID } }, res);

    expect(res.body.data.evidenceImage).toBe(IMAGE);
  });
});

describe("removeReportedUser", () => {
  const makeReport = (status = "Pending") => ({ _id: REPORT_ID, status, reportedUser: OTHER });
  const io = () => {
    const disconnectSockets = vi.fn();
    return { disconnectSockets, app: { get: () => ({ in: () => ({ disconnectSockets }) }) } };
  };

  test("flags the user, revokes sessions, resolves their pending reports and drops sockets", async () => {
    const target = { _id: OTHER, role: "User", save: vi.fn() };
    Report.findById.mockResolvedValue(makeReport());
    User.findById.mockResolvedValue(target);
    const { app, disconnectSockets } = io();
    const res = makeRes();

    await removeReportedUser({ params: { id: REPORT_ID }, user: { id: "admin-1" }, body: { adminNote: " spam " }, app }, res);

    expect(target.isRemoved).toBe(true);
    expect(target.save).toHaveBeenCalled();
    expect(revokeAllUserSessions).toHaveBeenCalledWith(OTHER);
    expect(Report.updateMany).toHaveBeenCalledWith(
      { reportedUser: OTHER, status: "Pending" },
      { $set: expect.objectContaining({ status: "Resolved", reviewedBy: "admin-1", adminNote: "spam" }) }
    );
    expect(disconnectSockets).toHaveBeenCalledWith(true);
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  test("will not remove an administrator", async () => {
    Report.findById.mockResolvedValue(makeReport());
    User.findById.mockResolvedValue({ _id: OTHER, role: "Admin", save: vi.fn() });
    const res = makeRes();

    await removeReportedUser({ params: { id: REPORT_ID }, user: { id: "admin-1" }, body: {}, app: io().app }, res);

    expect(res.statusCode).toBe(403);
    expect(revokeAllUserSessions).not.toHaveBeenCalled();
  });

  test("409s for a report that was already reviewed", async () => {
    Report.findById.mockResolvedValue(makeReport("Rejected"));
    const res = makeRes();

    await removeReportedUser({ params: { id: REPORT_ID }, user: { id: "admin-1" }, body: {}, app: io().app }, res);

    expect(res.statusCode).toBe(409);
    expect(User.findById).not.toHaveBeenCalled();
  });
});

describe("rejectReport", () => {
  test("marks a pending report as rejected without touching the user", async () => {
    const report = { _id: REPORT_ID, status: "Pending", save: vi.fn() };
    Report.findById.mockResolvedValue(report);
    const res = makeRes();

    await rejectReport({ params: { id: REPORT_ID }, user: { id: "admin-1" }, body: {} }, res);

    expect(report.status).toBe("Rejected");
    expect(report.reviewedBy).toBe("admin-1");
    expect(report.save).toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("404s for a malformed id", async () => {
    const res = makeRes();
    await rejectReport({ params: { id: "bad" }, user: { id: "admin-1" }, body: {} }, res);
    expect(res.statusCode).toBe(404);
  });
});
