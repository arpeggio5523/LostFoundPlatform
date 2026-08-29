import nodemailer from "nodemailer";

const isDevelopment = process.env.NODE_ENV !== "production";
let verifiedTransporter = null;

const getSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };
};

const getTransporter = async () => {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    return null;
  }

  if (!verifiedTransporter) {
    const transporter = nodemailer.createTransport(smtpConfig);
    await transporter.verify();
    verifiedTransporter = transporter;
  }

  return verifiedTransporter;
};

const buildVerificationEmailHtml = ({ fullName, verificationUrl, email, apiVerificationUrl }) => `
  <p>Hello ${fullName || "there"},</p>
  <p>Thank you for registering for LostFound MY.</p>
  <p>Please verify your email by clicking the link below:</p>
  <p><a href="${verificationUrl}">${verificationUrl}</a></p>
  <p>If the link does not open in the app, you can submit your verification token to the backend endpoint manually.</p>
  <p>Email: ${email}</p>
  <p>API endpoint: ${apiVerificationUrl}</p>
  <p>If you did not create this account, you can ignore this email.</p>
`;

export const sendVerificationEmail = async ({ email, fullName, verificationUrl }) => {
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  const apiVerificationUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/auth/verify-email`;

  const transporter = await getTransporter();

  if (!transporter) {
    if (isDevelopment) {
      console.warn(
        "SMTP configuration is missing. Verification email was not sent; using console fallback instead."
      );
      console.log(`Email verification URL for ${email}: ${verificationUrl}`);
      return;
    }

    throw new Error("SMTP configuration is missing");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your LostFound MY account",
    text: [
      `Hello ${fullName || "there"},`,
      "",
      "Thank you for registering for LostFound MY.",
      "Please verify your email using the link below:",
      verificationUrl,
      "",
      "If the frontend page is unavailable, submit the token to this endpoint:",
      apiVerificationUrl,
      `Email: ${email}`,
    ].join("\n"),
    html: buildVerificationEmailHtml({
      fullName,
      verificationUrl,
      email,
      apiVerificationUrl,
    }),
  });
};

export const sendContactOwnerEmail = async ({ ownerEmail, ownerName, postTitle, senderEmail }) => {
  const transporter = await getTransporter();

  if (!transporter) {
    if (isDevelopment) {
      console.warn(
        "SMTP configuration is missing. Contact Owner email was not sent; using console fallback instead."
      );
      console.log(`Contact Owner Email:\nTo: ${ownerEmail}\nSubject: Inquiry regarding your LostFound MY post: ${postTitle}\nFrom: ${senderEmail}`);
      return;
    }

    throw new Error("SMTP configuration is missing");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: ownerEmail,
    subject: `Inquiry regarding your LostFound MY post: ${postTitle}`,
    text: [
      `Hi ${ownerName || "there"},`,
      "",
      `Someone has contacted you regarding your post "${postTitle}" on LostFound MY.`,
      "",
      `You can reach them directly via email at: ${senderEmail}`,
      "",
      "Please coordinate with them via email to manage the item recovery or exchange.",
      "",
      "Best regards,",
      "",
      "The LostFound MY Team",
    ].join("\n"),
  });
};

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

export const buildNewMessageNotificationEmail = ({
  recipientName,
  senderName,
  messageText,
  itemTitle,
  conversationUrl,
}) => {
  const safeRecipientName = recipientName || "there";
  const safeSenderName = senderName || "Someone";
  const safeItemTitle = itemTitle || "your item";
  const safeMessageText = messageText || "(no message text provided)";
  const safeConversationUrl = conversationUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/messages`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Hello ${escapeHtml(safeRecipientName)},</p>
      <p>You have a new message about <strong>${escapeHtml(safeItemTitle)}</strong> on LostFound MY.</p>
      <p><strong>${escapeHtml(safeSenderName)}</strong> sent you a message:</p>
      <blockquote style="margin: 12px 0; padding: 12px 16px; background: #f3f4f6; border-left: 4px solid #2563eb; color: #111827;">
        ${escapeHtml(safeMessageText).replace(/\n/g, "<br />")}
      </blockquote>
      <p>Reply to them here:</p>
      <p><a href="${escapeHtml(safeConversationUrl)}">${escapeHtml(safeConversationUrl)}</a></p>
      <p>Best regards,<br />The LostFound MY Team</p>
    </div>
  `;
};

export const sendNewMessageNotificationEmail = async ({
  toEmail,
  recipientName,
  senderName,
  messageText,
  itemTitle,
  conversationUrl,
}) => {
  const transporter = await getTransporter();

  if (!transporter) {
    if (isDevelopment) {
      console.warn(
        "SMTP configuration is missing. New message notification email was not sent; using console fallback instead."
      );
      console.log(`New Message Notification Email:\nTo: ${toEmail}\nSubject: New message about ${itemTitle}\nFrom: ${senderName}\nMessage: ${messageText}`);
      return;
    }

    throw new Error("SMTP configuration is missing");
  }

  const normalizedConversationUrl = conversationUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/messages`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: `New message about ${itemTitle || "your item"}`,
    text: [
      `Hi ${recipientName || "there"},`,
      "",
      `You have a new message about "${itemTitle || "your item"}" on LostFound MY.`,
      "",
      `${senderName || "Someone"} said:`,
      messageText || "(no message text provided)",
      "",
      `Reply here: ${normalizedConversationUrl}`,
      "",
      "Best regards,",
      "",
      "The LostFound MY Team",
    ].join("\n"),
    html: buildNewMessageNotificationEmail({
      recipientName,
      senderName,
      messageText,
      itemTitle,
      conversationUrl: normalizedConversationUrl,
    }),
  });
};
