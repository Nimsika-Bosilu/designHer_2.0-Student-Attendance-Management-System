// ==============================================
// Classroom Controller — Handles HTTP for Classrooms
// ==============================================

const classroomService = require("../services/classroomService");

// -----------------------------------------------
// POST /api/classrooms
// Create a new classroom
// -----------------------------------------------
async function createClassroom(req, res) {
  try {
    const name = req.body.name;
    const section = req.body.section;
    const teacherId = req.body.teacherId;

    const result = await classroomService.createClassroom(name, section, teacherId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create classroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/classrooms
// Get all classrooms
// -----------------------------------------------
async function getAllClassrooms(req, res) {
  try {
    const result = await classroomService.getAllClassrooms();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classrooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/classrooms/:id
// Get one classroom by ID
// -----------------------------------------------
async function getClassroomById(req, res) {
  try {
    // req.params.id is a string, so we convert it to a number
    const id = parseInt(req.params.id);

    const result = await classroomService.getClassroomById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/classrooms/teacher/:teacherId
// Get classrooms for a specific teacher
// -----------------------------------------------
async function getClassroomsByTeacher(req, res) {
  try {
    const teacherId = parseInt(req.params.teacherId);

    const result = await classroomService.getClassroomsByTeacherId(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher classrooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

module.exports = {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacher,
};
