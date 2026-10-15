const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Sends an email using the Brevo API (formerly Sendinblue) over standard HTTPS (Port 443).
 * This avoids Render's strict SMTP port blocks and allows sending from a single verified free email address (like Gmail) to any recipient!
 */
const sendEmailWithProvider = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "ramborkar2006@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "LostFound MY";

  if (!apiKey) {
    if (isDevelopment) {
      console.warn("BREVO_API_KEY is missing. Email was not sent; using console fallback instead.");
      console.log(`[Email Fallback]\nTo: ${to}\nSubject: ${subject}\nText:\n${text}`);
      return;
    }
    throw new Error("BREVO_API_KEY is missing in production environment");
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
  };
  
  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Brevo API Error:", errorData);
    throw new Error(errorData.message || "Failed to send email via Brevo API");
  }

  return response.json();
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
  const apiBaseUrl = process.env.API_BASE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  const apiVerificationUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/auth/verify-email`;

  await sendEmailWithProvider({
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
  await sendEmailWithProvider({
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
  .replace(/"/g, "&quot;")
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
      <p><a href="${escapeHtml(safeConversationUrl)}">View conversation</a></p>
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
  const normalizedConversationUrl = conversationUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/messages`;

  await sendEmailWithProvider({
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
      `View conversation: ${normalizedConversationUrl}`,
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
