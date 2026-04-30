// ==============================================
// Attendance Routes — /api/attendance
// ==============================================

import express from "express";
const router = express.Router();

// Import controller
import {
  markAttendance,
  markBulkAttendance,
  getAttendanceByClassroom,
  getAttendanceByStudent,
} from "../controllers/attendanceController.js";

// Import middleware
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// -----------------------------------------------
// All attendance routes need login (verifyToken)
// -----------------------------------------------

// Teacher or Admin: mark attendance for one student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), markAttendance);

// Teacher or Admin: mark attendance for many students at once
router.post("/bulk", verifyToken, authorizeRoles("admin", "teacher"), markBulkAttendance);

// Any logged-in user: get attendance for a classroom on a date
router.get("/classroom/:classroomId", verifyToken, getAttendanceByClassroom);

// Any logged-in user: get attendance history for a student
router.get("/student/:studentId", verifyToken, getAttendanceByStudent);

export default router;
