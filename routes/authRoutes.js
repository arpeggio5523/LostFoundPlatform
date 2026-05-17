import express from "express";
const router = express.Router();

import {
  signup,
  login,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

// Route for verifying registered user emails
router.post("/verify-email", verifyEmail);

// Route for resending email verification links
router.post("/resend-verification", resendVerification);

export default router;
