// ==============================================
// Classroom Routes — /api/classrooms
// ==============================================

import express from "express";
const router = express.Router();

// Import controller
import {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacher,
} from "../controllers/classroomController.js";

// Import middleware
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// -----------------------------------------------
// All classroom routes need login (verifyToken)
// -----------------------------------------------

// Admin only: create a new classroom
router.post("/", verifyToken, authorizeRoles("admin"), createClassroom);

// Any logged-in user: get all classrooms
router.get("/", verifyToken, getAllClassrooms);

// Any logged-in user: get one classroom by ID
router.get("/:id", verifyToken, getClassroomById);

// Any logged-in user: get classrooms for a specific teacher
router.get("/teacher/:teacherId", verifyToken, getClassroomsByTeacher);

export default router;
