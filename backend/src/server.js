// ==============================================
// Server Entry Point — The Main File
// ==============================================
// This is where our application starts.
// It creates the Express server, adds middleware,
// connects all routes, and starts listening.
// ==============================================

// Step 1: Load environment variables from .env file
// This MUST be the very first thing we do!
require("dotenv").config();

// Step 2: Import packages
const express = require("express");
const cors = require("cors");

// Step 3: Import our route files
const authRoutes = require("./routes/authRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

// Step 4: Create the Express app
const app = express();

// Step 5: Add middleware
// -----------------------------------------------
// cors() — Allows the React frontend to talk to this backend
// Without this, the browser will BLOCK the requests!
// -----------------------------------------------
app.use(cors());

// -----------------------------------------------
// express.json() — Tells Express to understand JSON data
// When the frontend sends JSON in the body, Express
// can read it as req.body
// -----------------------------------------------
app.use(express.json());

// Step 6: Connect routes
// All auth routes start with /api/auth
app.use("/api/auth", authRoutes);

// All classroom routes start with /api/classrooms
app.use("/api/classrooms", classroomRoutes);

// All student routes start with /api/students
app.use("/api/students", studentRoutes);

// All attendance routes start with /api/attendance
app.use("/api/attendance", attendanceRoutes);

// Step 7: A simple test route
// Visit http://localhost:5000/ to check if the server is running
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "designHer 2.0 Attendance API is running!",
    data: null,
  });
});

// Step 8: Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("");
  console.log("==============================================");
  console.log("  designHer 2.0 Attendance API");
  console.log(`  Server is running on http://localhost:${PORT}`);
  console.log("==============================================");
  console.log("");
});
