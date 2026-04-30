// ==============================================
// Auth Repository — Database Operations for Users
// ==============================================
// This file ONLY talks to the database.
// It does NOT know about HTTP, requests, or responses.
// It just finds or creates user records.
// ==============================================

const prisma = require("../config/db");

// -----------------------------------------------
// Find a user by their email address
// We use this during login to check if the user exists
// -----------------------------------------------
async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
}

// -----------------------------------------------
// Find a user by their ID
// We use this to get user details after login
// -----------------------------------------------
async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

// -----------------------------------------------
// Create a new user in the database
// We use this during registration
// -----------------------------------------------
async function createUser(name, email, hashedPassword, role) {
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    },
  });
  return newUser;
}

// -----------------------------------------------
// Get all users from the database
// We use this for the admin dashboard
// -----------------------------------------------
async function findAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // We do NOT select password — never send passwords!
    },
  });
  return users;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  findAllUsers,
};
