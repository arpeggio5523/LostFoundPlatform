import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const DEFAULT_ACCESS_EXPIRES_IN = "15m";
const DEFAULT_REFRESH_EXPIRES_DAYS = 7;
const DEFAULT_REFRESH_COOKIE_NAME = "refreshToken";

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET;

const getAccessExpiresIn = () =>
  process.env.JWT_ACCESS_EXPIRES_IN || DEFAULT_ACCESS_EXPIRES_IN;

const getRefreshExpiresDays = () => {
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS);

  if (Number.isFinite(days) && days > 0) {
    return days;
  }

  return DEFAULT_REFRESH_EXPIRES_DAYS;
};

const getCookieName = () =>
  process.env.REFRESH_TOKEN_COOKIE_NAME || DEFAULT_REFRESH_COOKIE_NAME;

const getCookieSecure = () => {
  if (process.env.REFRESH_TOKEN_COOKIE_SECURE === "true") {
    return true;
  }

  if (process.env.REFRESH_TOKEN_COOKIE_SECURE === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production";
};

const getCookieSameSite = () =>
  process.env.REFRESH_TOKEN_COOKIE_SAME_SITE || "lax";

const getCookiePath = () =>
  process.env.REFRESH_TOKEN_COOKIE_PATH || "/api/auth";

const getCookieDomain = () => process.env.REFRESH_TOKEN_COOKIE_DOMAIN;

const getRefreshExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + getRefreshExpiresDays());
  return expiresAt;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateTokenId = () => crypto.randomBytes(32).toString("hex");

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  createdAt: user.createdAt, 
  phoneNumber: user.phoneNumber,
  ...(typeof user.role !== "undefined" ? { role: user.role } : {}),
  ...(typeof user.isEmailVerified !== "undefined"
    ? { isEmailVerified: user.isEmailVerified }
    : {}),
});

const buildAccessTokenPayload = (user, sessionId) => ({
  sub: user._id.toString(),
  email: user.email,
  ...(typeof user.role !== "undefined" ? { role: user.role } : {}),
  sid: sessionId.toString(),
});

export const signAccessToken = (user, sessionId) => {
  const secret = getAccessSecret();

  if (!secret) {
    throw new Error("JWT access secret is not configured.");
  }

  return jwt.sign(buildAccessTokenPayload(user, sessionId), secret, {
    expiresIn: getAccessExpiresIn(),
  });
};

export const verifyAccessToken = (token) => {
  const secret = getAccessSecret();

  if (!secret) {
    throw new Error("JWT access secret is not configured.");
  }

  return jwt.verify(token, secret);
};

const signRefreshToken = (userId, sessionId, expiresAt) => {
  const secret = getRefreshSecret();

  if (!secret) {
    throw new Error("JWT refresh secret is not configured.");
  }

  return jwt.sign(
    {
      sub: userId.toString(),
      sid: sessionId.toString(),
      jti: generateTokenId(),
    },
    secret,
    {
      expiresIn: Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
    }
  );
};

export const verifyRefreshToken = (token) => {
  const secret = getRefreshSecret();

  if (!secret) {
    throw new Error("JWT refresh secret is not configured.");
  }

  return jwt.verify(token, secret);
};

export const getClientMetadata = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || req.ip;

  return {
    userAgent: req.get("user-agent") || undefined,
    ipAddress,
  };
};

export const createRefreshSession = async ({
  user,
  userAgent,
  ipAddress,
  isPersistent = false,
}) => {
  const expiresAt = getRefreshExpiryDate();
  const session = new Session({
    userId: user._id,
    refreshTokenHash: "pending",
    expiresAt,
    isPersistent,
    userAgent,
    ipAddress,
  });

  const refreshToken = signRefreshToken(user._id, session._id, expiresAt);
  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

  return {
    session,
    refreshToken,
  };
};

export const rotateRefreshSession = async (session, metadata) => {
  const replacement = await createRefreshSession({
    user: { _id: session.userId },
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    isPersistent: session.isPersistent,
  });

  session.revokedAt = new Date();
  session.replacedByTokenHash = replacement.session.refreshTokenHash;
  await session.save();

  return replacement;
};

export const revokeSession = async (session) => {
  if (!session || session.revokedAt) {
    return;
  }

  session.revokedAt = new Date();
  await session.save();
};

export const revokeAllUserSessions = async (userId) => {
  await Session.updateMany(
    {
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

export const findSessionByRefreshToken = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOne({
    _id: payload.sid,
    userId: payload.sub,
    refreshTokenHash,
  });

  return {
    payload,
    session,
  };
};

export const isSessionActive = (session) =>
  Boolean(
    session &&
      !session.revokedAt &&
      session.expiresAt &&
      session.expiresAt.getTime() > Date.now()
  );

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

export const getRefreshTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[getCookieName()] || req.body?.refreshToken || null;
};

export const getAccessTokenFromRequest = (req) => {
  const authorization = req.get("authorization") || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.accessToken || null;
};

const buildRefreshCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: getCookieSameSite(),
    path: getCookiePath(),
  };

  const domain = getCookieDomain();
  if (domain) {
    options.domain = domain;
  }

  return options;
};

export const attachRefreshTokenCookie = (
  res,
  refreshToken,
  { isPersistent = false } = {}
) => {
  const cookieOptions = {
    ...buildRefreshCookieOptions(),
  };

  if (isPersistent) {
    cookieOptions.expires = getRefreshExpiryDate();
  }

  res.cookie(getCookieName(), refreshToken, cookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(getCookieName(), buildRefreshCookieOptions());
};

export const buildAuthResponse = ({ user, sessionId, refreshToken, includeRefreshToken }) => {
  const accessToken = signAccessToken(user, sessionId);

  return {
    accessToken,
    ...(includeRefreshToken ? { refreshToken } : {}),
    user: sanitizeUser(user),
  };
};

export { hashToken, sanitizeUser };
