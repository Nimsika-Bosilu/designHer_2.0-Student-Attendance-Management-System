// ==============================================
// Classroom Routes — /api/classrooms
// ==============================================

const express = require("express");
const router = express.Router();

// Import controller
const classroomController = require("../controllers/classroomController");

// Import middleware
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

// -----------------------------------------------
// All classroom routes need login (verifyToken)
// -----------------------------------------------

// Admin only: create a new classroom
router.post("/", verifyToken, authorizeRoles("admin"), classroomController.createClassroom);

// Any logged-in user: get all classrooms
router.get("/", verifyToken, classroomController.getAllClassrooms);

// Any logged-in user: get one classroom by ID
router.get("/:id", verifyToken, classroomController.getClassroomById);

// Any logged-in user: get classrooms for a specific teacher
router.get("/teacher/:teacherId", verifyToken, classroomController.getClassroomsByTeacher);

module.exports = router;
