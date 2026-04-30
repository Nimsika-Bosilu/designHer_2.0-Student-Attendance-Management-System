// ==============================================
// Auth Routes — /api/auth
// ==============================================
// This file defines the URL paths for auth.
// It connects each URL to the right controller function.
// ==============================================

const express = require("express");
const router = express.Router();

// Import controller
const authController = require("../controllers/authController");

// Import middleware
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

// -----------------------------------------------
// Public routes (no login needed)
// -----------------------------------------------
router.post("/register", authController.register);
router.post("/login", authController.login);

// -----------------------------------------------
// Protected routes (login needed)
// -----------------------------------------------
router.get("/me", verifyToken, authController.getMe);

// Admin only route
router.get("/users", verifyToken, authorizeRoles("admin"), authController.getUsers);

module.exports = router;
