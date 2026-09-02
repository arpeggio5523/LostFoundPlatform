import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";

const loadEmailService = async () => {
  vi.resetModules();
  const service = await import("../../../src/utils/emailService.js");
  return { ...service };
};

describe("emailService (Resend via fetch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.RESEND_API_KEY = "re_mock_test_key";
    process.env.EMAIL_FROM = "LostFound MY <noreply@example.com>";
    process.env.FRONTEND_URL = "http://localhost:5173";
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "mock_resend_id" })
    });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.FRONTEND_URL;
    delete global.fetch;
  });

  test("sendVerificationEmail sends a verification message when RESEND_API_KEY is configured", async () => {
    const { sendVerificationEmail } = await loadEmailService();

    await sendVerificationEmail({
      email: "student@example.com",
      fullName: "Aisha",
      verificationUrl: "http://localhost:5173/verify-email?email=student@example.com&token=abc123",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Authorization": "Bearer re_mock_test_key"
      })
    }));

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.to).toBe("student@example.com");
    expect(callBody.subject).toBe("Verify your LostFound MY account");
    expect(callBody.html).toContain("Aisha");
    expect(callBody.html).toContain("http://localhost:5173/verify-email?email=student@example.com&token=abc123");
  });

  test("sendNewMessageNotificationEmail includes the sender, item title, and conversation link", async () => {
    const { sendNewMessageNotificationEmail, buildNewMessageNotificationEmail } = await loadEmailService();

    const html = buildNewMessageNotificationEmail({
      recipientName: "Liam",
      senderName: "Aisha",
      messageText: "Is this your red backpack?",
      itemTitle: "Red backpack",
      conversationUrl: "http://localhost:5173/messages",
    });

    expect(html).toContain("Liam");
    expect(html).toContain("Red backpack");
    expect(html).toContain("Aisha");
    expect(html).toContain("http://localhost:5173/messages");

    await sendNewMessageNotificationEmail({
      toEmail: "owner@example.com",
      recipientName: "Liam",
      senderName: "Aisha",
      messageText: "Is this your red backpack?",
      itemTitle: "Red backpack",
      conversationUrl: "http://localhost:5173/messages",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.to).toBe("owner@example.com");
    expect(callBody.subject).toBe("New message about Red backpack");
    expect(callBody.text).toContain("Aisha said:");
    expect(callBody.text).toContain("Is this your red backpack?");
    expect(callBody.text).toContain("http://localhost:5173/messages");
  });

  test("sendContactOwnerEmail creates a direct owner inquiry email when configured", async () => {
    const { sendContactOwnerEmail } = await loadEmailService();

    await sendContactOwnerEmail({
      ownerEmail: "owner@example.com",
      ownerName: "Liam",
      postTitle: "Red backpack",
      senderEmail: "finder@example.com",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.to).toBe("owner@example.com");
    expect(callBody.subject).toBe("Inquiry regarding your LostFound MY post: Red backpack");
    expect(callBody.text).toContain("finder@example.com");
    expect(callBody.text).toContain("Red backpack");
  });
});
