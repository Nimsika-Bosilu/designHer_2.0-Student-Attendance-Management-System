// ==============================================
// Student Routes — /api/students
// ==============================================

import express from "express";
const router = express.Router();

// Import controller
import {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClassroom,
} from "../controllers/studentController.js";

// Import middleware
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// -----------------------------------------------
// All student routes need login (verifyToken)
// -----------------------------------------------

// Admin or Teacher: create a new student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), createStudent);

// Any logged-in user: get all students
router.get("/", verifyToken, getAllStudents);

// Any logged-in user: get one student by ID
router.get("/:id", verifyToken, getStudentById);

// Any logged-in user: get students in a classroom
router.get("/classroom/:classroomId", verifyToken, getStudentsByClassroom);

export default router;
