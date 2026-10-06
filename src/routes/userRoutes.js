import express from "express";
import { getUsers, createUser, loginUser } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updatePrivacyMode } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);   
router.post("/signup", createUser);
router.post("/login", loginUser); 
router.patch("/me/privacy", requireAuth, updatePrivacyMode);

export default router;
