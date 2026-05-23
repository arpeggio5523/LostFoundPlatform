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
