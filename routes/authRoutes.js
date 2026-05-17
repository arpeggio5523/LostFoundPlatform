import express from "express";
const router = express.Router();

import {
  getCurrentUser,
  signup,
  login,
  logout,
  logoutAll,
  refresh,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

// Route for refreshing the current session
router.post("/refresh", refresh);

// Route for logging out the current session
router.post("/logout", logout);

// Route for logging out all sessions for the current user
router.post("/logout-all", requireAuth, logoutAll);

// Route for verifying registered user emails
router.post("/verify-email", verifyEmail);

// Route for resending email verification links
router.post("/resend-verification", resendVerification);

// Route for getting the authenticated user's session info
router.get("/me", requireAuth, getCurrentUser);

export default router;
