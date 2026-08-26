import User from "../models/User.js";
import {
  getAccessTokenFromRequest,
  sanitizeUser,
  verifyAccessToken,
} from "../utils/authSession.js";

export const requireAuth = async (req, res, next) => {
  try {
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const payload = verifyAccessToken(accessToken);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    req.user = {
      ...sanitizeUser(user),
      id: user._id.toString(), // maintain backward compatibility with ItemController
      sid: payload.sid,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return next();
    }

    const payload = verifyAccessToken(accessToken);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    req.user = {
      ...sanitizeUser(user),
      id: user._id.toString(),
      sid: payload.sid,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }
};
