vi.mock("nodemailer", () => ({
  __esModule: true,
  default: {
    createTransport: vi.fn(),
  },
}));

import nodemailer from "nodemailer";

const makeTransport = () => ({
  verify: vi.fn().mockResolvedValue(true),
  sendMail: vi.fn().mockResolvedValue(true),
});

const loadEmailService = async () => {
  vi.resetModules();
  const service = await import("../../../src/utils/emailService.js");
  const nodemailerMock = (await import("nodemailer")).default;
  return { ...service, nodemailerMock };
};

describe("emailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "password";
    process.env.SMTP_FROM = "LostFound MY <noreply@example.com>";
    process.env.FRONTEND_URL = "http://localhost:5173";
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    delete process.env.FRONTEND_URL;
  });

  test("sendVerificationEmail sends a verification message when SMTP is configured", async () => {
    const { sendVerificationEmail, nodemailerMock } = await loadEmailService();
    
    const transporter = makeTransport();
    nodemailerMock.createTransport.mockReturnValue(transporter);

    await sendVerificationEmail({
      email: "student@example.com",
      fullName: "Aisha",
      verificationUrl: "http://localhost:5173/verify-email?email=student@example.com&token=abc123",
    });

    expect(transporter.verify).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: "Verify your LostFound MY account",
      })
    );

    const mailOptions = transporter.sendMail.mock.calls[0][0];
    expect(mailOptions.html).toContain("Aisha");
    expect(mailOptions.html).toContain("http://localhost:5173/verify-email?email=student@example.com&token=abc123");
  });

  test("sendNewMessageNotificationEmail includes the sender, item title, and conversation link", async () => {
    const { sendNewMessageNotificationEmail, buildNewMessageNotificationEmail, nodemailerMock } = await loadEmailService();
    
    const transporter = makeTransport();
    nodemailerMock.createTransport.mockReturnValue(transporter);

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

    expect(transporter.verify).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: "New message about Red backpack",
      })
    );

    const mailOptions = transporter.sendMail.mock.calls[0][0];
    expect(mailOptions.text).toContain("Aisha said:");
    expect(mailOptions.text).toContain("Is this your red backpack?");
    expect(mailOptions.text).toContain("http://localhost:5173/messages");
  });

  test("sendContactOwnerEmail creates a direct owner inquiry email when configured", async () => {
    const { sendContactOwnerEmail, nodemailerMock } = await loadEmailService();
    
    const transporter = makeTransport();
    nodemailerMock.createTransport.mockReturnValue(transporter);

    await sendContactOwnerEmail({
      ownerEmail: "owner@example.com",
      ownerName: "Liam",
      postTitle: "Red backpack",
      senderEmail: "finder@example.com",
    });

    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: "Inquiry regarding your LostFound MY post: Red backpack",
      })
    );

    const mailOptions = transporter.sendMail.mock.calls[0][0];
    expect(mailOptions.text).toContain("finder@example.com");
    expect(mailOptions.text).toContain("Red backpack");
  });
});
