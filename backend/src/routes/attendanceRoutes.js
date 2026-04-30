// ==============================================
// Attendance Routes — /api/attendance
// ==============================================

const express = require("express");
const router = express.Router();

// Import controller
const attendanceController = require("../controllers/attendanceController");

// Import middleware
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

// -----------------------------------------------
// All attendance routes need login (verifyToken)
// -----------------------------------------------

// Teacher or Admin: mark attendance for one student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), attendanceController.markAttendance);

// Teacher or Admin: mark attendance for many students at once
router.post("/bulk", verifyToken, authorizeRoles("admin", "teacher"), attendanceController.markBulkAttendance);

// Any logged-in user: get attendance for a classroom on a date
router.get("/classroom/:classroomId", verifyToken, attendanceController.getAttendanceByClassroom);

// Any logged-in user: get attendance history for a student
router.get("/student/:studentId", verifyToken, attendanceController.getAttendanceByStudent);

module.exports = router;
