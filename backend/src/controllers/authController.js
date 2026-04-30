// ==============================================
// Auth Controller — Handles HTTP for Auth
// ==============================================
// This file receives HTTP requests and sends
// HTTP responses. It calls the service layer
// to do the actual work.
// ==============================================

import { registerUser, loginUser, getAllUsers } from "../services/authService.js";

// -----------------------------------------------
// POST /api/auth/register
// Register a new user
// -----------------------------------------------
async function register(req, res) {
  try {
    // Get data from the request body
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    // Validate: all fields are required
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        data: null,
      });
    }

    // Call the service to register the user
    const result = await registerUser(name, email, password, role);

    // If registration failed (e.g., email already exists)
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Registration successful — return 201 (Created)
    return res.status(201).json(result);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// POST /api/auth/login
// Login a user and return a JWT token
// -----------------------------------------------
async function login(req, res) {
  try {
    // Get data from the request body
    const email = req.body.email;
    const password = req.body.password;

    // Validate: email and password are required
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        data: null,
      });
    }

    // Call the service to login
    const result = await loginUser(email, password);

    // If login failed (wrong email or password)
    if (!result.success) {
      return res.status(401).json(result);
    }

    // Login successful
    return res.status(200).json(result);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/auth/users
// Get all users (admin only)
// -----------------------------------------------
async function getUsers(req, res) {
  try {
    const result = await getAllUsers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/auth/me
// Get the currently logged-in user's info
// -----------------------------------------------
async function getMe(req, res) {
  try {
    // req.user is set by the auth middleware
    return res.status(200).json({
      success: true,
      message: "User info retrieved successfully.",
      data: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

export {
  register,
  login,
  getUsers,
  getMe,
};
