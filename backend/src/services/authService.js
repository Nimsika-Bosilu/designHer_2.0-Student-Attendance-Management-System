// ==============================================
// Auth Service — Business Logic for Auth
// ==============================================
// This file handles the LOGIC for login and register.
// It uses the repository to talk to the database.
// It uses bcrypt to hash passwords.
// It uses jsonwebtoken to create login tokens.
// ==============================================

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, findAllUsers } from "../repositories/authRepository.js";

// -----------------------------------------------
// Register a new user
// -----------------------------------------------
async function registerUser(name, email, password, role) {
  // Step 1: Check if a user with this email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "A user with this email already exists.",
      data: null,
    };
  }

  // Step 2: Hash the password (NEVER save plain text passwords!)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Save the new user to the database
  const newUser = await createUser(name, email, hashedPassword, role);

  // Step 4: Return success (but do NOT return the password!)
  return {
    success: true,
    message: "User registered successfully.",
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

// -----------------------------------------------
// Login a user
// -----------------------------------------------
async function loginUser(email, password) {
  // Step 1: Find the user by email
  const user = await findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 2: Compare the typed password with the stored hash
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 3: Create a JWT token
  // The token contains the user's ID and role.
  // It expires in 24 hours.
  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Step 4: Return success with the token
  return {
    success: true,
    message: "Login successful.",
    data: {
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
}

// -----------------------------------------------
// Get all users (for admin)
// -----------------------------------------------
async function getAllUsers() {
  const users = await findAllUsers();
  return {
    success: true,
    message: "Users retrieved successfully.",
    data: users,
  };
}

export {
  registerUser,
  loginUser,
  getAllUsers,
};
