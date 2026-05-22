import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import {
  attachRefreshTokenCookie,
  buildAuthResponse,
  clearRefreshTokenCookie,
  createRefreshSession,
  findSessionByRefreshToken,
  getClientMetadata,
  getRefreshTokenFromRequest,
  isSessionActive,
  revokeAllUserSessions,
  revokeSession,
  rotateRefreshSession,
} from "../utils/authSession.js";

const DEFAULT_EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES = 30;
const VERIFICATION_EMAIL_COOLDOWN_MS = 60 * 1000;
const GENERIC_RESEND_MESSAGE =
  "If an account with that email exists and is not yet verified, a verification email will be sent.";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const getEmailVerificationExpiryMinutes = () => {
  const expiryMinutes = Number(process.env.EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES);

  if (Number.isFinite(expiryMinutes) && expiryMinutes > 0) {
    return expiryMinutes;
  }

  return DEFAULT_EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES;
};

const generateEmailVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(
    Date.now() + getEmailVerificationExpiryMinutes() * 60 * 1000
  );

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
};

const buildVerificationUrl = ({ email, rawToken }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

  return `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(rawToken)}`;
};

const setVerificationTokenFields = (user) => {
  const { rawToken, tokenHash, expiresAt } = generateEmailVerificationToken();

  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpires = expiresAt;
  user.lastVerificationEmailSentAt = new Date();

  return rawToken;
};

const issueSessionTokens = async (req, res, user, { rememberMe = false } = {}) => {
  const metadata = getClientMetadata(req);
  const { session, refreshToken } = await createRefreshSession({
    user,
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    isPersistent: rememberMe,
  });

  attachRefreshTokenCookie(res, refreshToken, {
    isPersistent: rememberMe,
  });

  return buildAuthResponse({
    user,
    sessionId: session._id,
    refreshToken,
    includeRefreshToken: false,
  });
};

// Register a new user into the system
export const signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, occupation, password} = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password,
      ...(phoneNumber && { phoneNumber }),
      ...(occupation && { occupation }),
      isEmailVerified: false,
    });

    const rawToken = setVerificationTokenFields(newUser);

    await newUser.save();
    await sendVerificationEmail({
      email: newUser.email,
      fullName: newUser.fullName,
      verificationUrl: buildVerificationUrl({
        email: newUser.email,
        rawToken,
      }),
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;

      return res.status(400).json({
        message: firstError,
      });
    }

    return res.status(500).json({
      message: "Signup failed. Please try again.",
    });
  }
};

// Authenticate existing user credentials and log in
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    const authResponse = await issueSessionTokens(req, res, user, {
      rememberMe: Boolean(rememberMe),
    });

    res.status(200).json({
      message: "Login successful",
      ...authResponse,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { token } = req.body;

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+emailVerificationTokenHash"
    );

    if (!user || !token || !user.emailVerificationTokenHash) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (
      user.emailVerificationTokenHash !== tokenHash ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(200).json({
        message: GENERIC_RESEND_MESSAGE,
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        message: GENERIC_RESEND_MESSAGE,
      });
    }

    if (
      user.lastVerificationEmailSentAt &&
      Date.now() - user.lastVerificationEmailSentAt.getTime() < VERIFICATION_EMAIL_COOLDOWN_MS
    ) {
      return res.status(200).json({
        message: GENERIC_RESEND_MESSAGE,
      });
    }

    const rawToken = setVerificationTokenFields(user);

    await user.save();
    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        verificationUrl: buildVerificationUrl({
          email: user.email,
          rawToken,
        }),
      });
    } catch (error) {
      console.error("Failed to resend verification email:", error.message);
    }

    return res.status(200).json({
      message: GENERIC_RESEND_MESSAGE,
    });
  } catch (error) {
    console.error("Resend verification failed:", error.message);

    return res.status(200).json({
      message: GENERIC_RESEND_MESSAGE,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const { session } = await findSessionByRefreshToken(refreshToken);

    if (!isSessionActive(session)) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      await revokeSession(session);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const metadata = getClientMetadata(req);
    const rotated = await rotateRefreshSession(session, metadata);

    attachRefreshTokenCookie(res, rotated.refreshToken, {
      isPersistent: rotated.session.isPersistent,
    });

    return res.status(200).json({
      accessToken: buildAuthResponse({
        user,
        sessionId: rotated.session._id,
        refreshToken: rotated.refreshToken,
        includeRefreshToken: false,
      }).accessToken,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      try {
        const { session } = await findSessionByRefreshToken(refreshToken);
        await revokeSession(session);
      } catch (error) {
        // Return a safe success response even if the token is invalid.
      }
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      message: "Logged out successfully.",
    });
  }
};

export const logoutAll = async (req, res) => {
  try {
    await revokeAllUserSessions(req.user._id);
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      message: "All sessions cleared successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
