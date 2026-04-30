// ==============================================
// Prisma Client — Database Connection
// ==============================================
// This file creates ONE Prisma client for the
// entire application. We import this everywhere
// we need to talk to the database.
// ==============================================

// Import PrismaClient from the Prisma package
const { PrismaClient } = require("@prisma/client");

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Export it so other files can use it
module.exports = prisma;
