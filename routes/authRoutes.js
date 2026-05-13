import express from "express";
const router = express.Router();

import {
  signup,
  login
} from "../controllers/authController.js";

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

export default router;