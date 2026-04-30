// ==============================================
// Student Routes — /api/students
// ==============================================

const express = require("express");
const router = express.Router();

// Import controller
const studentController = require("../controllers/studentController");

// Import middleware
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

// -----------------------------------------------
// All student routes need login (verifyToken)
// -----------------------------------------------

// Admin or Teacher: create a new student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), studentController.createStudent);

// Any logged-in user: get all students
router.get("/", verifyToken, studentController.getAllStudents);

// Any logged-in user: get one student by ID
router.get("/:id", verifyToken, studentController.getStudentById);

// Any logged-in user: get students in a classroom
router.get("/classroom/:classroomId", verifyToken, studentController.getStudentsByClassroom);

module.exports = router;
