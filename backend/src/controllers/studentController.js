// ==============================================
// Student Controller — Handles HTTP for Students
// ==============================================

import * as studentService from "../services/studentService.js";

// -----------------------------------------------
// POST /api/students
// Create a new student
// -----------------------------------------------
async function createStudent(req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const registrationNumber = req.body.registrationNumber;
    const classroomId = req.body.classroomId;

    const result = await studentService.createStudent(
      name,
      email,
      registrationNumber,
      classroomId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/students
// Get all students
// -----------------------------------------------
async function getAllStudents(req, res) {
  try {
    let result;
    // Role-based filtering: Admin sees all, Teacher sees only theirs
    if (req.user.role === "admin") {
      result = await studentService.getAllStudents();
    } else {
      result = await studentService.getStudentsByTeacherId(req.user.userId);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/students/:id
// Get one student by ID
// -----------------------------------------------
async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.getStudentById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/students/classroom/:classroomId
// Get students in a classroom
// -----------------------------------------------
async function getStudentsByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const result = await studentService.getStudentsByClassroomId(classroomId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom students error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

export {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClassroom,
};
