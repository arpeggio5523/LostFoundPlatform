import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";

const loadEmailService = async () => {
  vi.resetModules();
  const service = await import("../../../src/utils/emailService.js");
  return { ...service };
};

describe("emailService (Brevo via fetch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.BREVO_API_KEY = "mock_brevo_key";
    process.env.BREVO_SENDER_EMAIL = "ramborkar2006@gmail.com";
    process.env.BREVO_SENDER_NAME = "LostFound MY Test";
    process.env.FRONTEND_URL = "http://localhost:5173";
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: "mock_brevo_id" })
    });
  });

  afterEach(() => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SENDER_EMAIL;
    delete process.env.BREVO_SENDER_NAME;
    delete process.env.FRONTEND_URL;
    delete global.fetch;
  });

  test("sendVerificationEmail sends a verification message when BREVO_API_KEY is configured", async () => {
    const { sendVerificationEmail } = await loadEmailService();

    await sendVerificationEmail({
      email: "student@example.com",
      fullName: "Aisha",
      verificationUrl: "http://localhost:5173/verify-email?email=student@example.com&token=abc123",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("https://api.brevo.com/v3/smtp/email", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "api-key": "mock_brevo_key"
      })
    }));

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.to[0].email).toBe("student@example.com");
    expect(callBody.subject).toBe("Verify your LostFound MY account");
    expect(callBody.htmlContent).toContain("Aisha");
    expect(callBody.htmlContent).toContain("http://localhost:5173/verify-email?email=student@example.com&token=abc123");
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
    expect(callBody.to[0].email).toBe("owner@example.com");
    expect(callBody.subject).toBe("New message about Red backpack");
    expect(callBody.textContent).toContain("Aisha said:");
    expect(callBody.textContent).toContain("Is this your red backpack?");
    expect(callBody.textContent).toContain("http://localhost:5173/messages");
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
    expect(callBody.to[0].email).toBe("owner@example.com");
    expect(callBody.subject).toBe("Inquiry regarding your LostFound MY post: Red backpack");
    expect(callBody.textContent).toContain("finder@example.com");
    expect(callBody.textContent).toContain("Red backpack");
  });
});
