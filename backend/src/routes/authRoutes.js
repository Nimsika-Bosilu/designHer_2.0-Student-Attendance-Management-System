// ==============================================
// Auth Routes — /api/auth
// ==============================================
// This file defines the URL paths for auth.
// It connects each URL to the right controller function.
// ==============================================

import express from "express";
const router = express.Router();

// Import controller
import { register, login, getUsers, getMe } from "../controllers/authController.js";

// Import middleware
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// -----------------------------------------------
// Public routes (no login needed)
// -----------------------------------------------
router.post("/register", register);
router.post("/login", login);

// -----------------------------------------------
// Protected routes (login needed)
// -----------------------------------------------
router.get("/me", verifyToken, getMe);

// Admin only route
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);

export default router;
