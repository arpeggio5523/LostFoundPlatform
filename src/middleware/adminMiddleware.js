import { requireAuth } from "./authMiddleware.js";

export const requireAdmin = [requireAuth, (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  return next();
}];