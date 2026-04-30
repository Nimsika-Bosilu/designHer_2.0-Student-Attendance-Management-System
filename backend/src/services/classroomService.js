// ==============================================
// Classroom Service — Business Logic
// ==============================================
// This file handles the LOGIC for classrooms.
// It validates data and uses the repository.
// ==============================================

const classroomRepository = require("../repositories/classroomRepository");

// -----------------------------------------------
// Create a new classroom
// -----------------------------------------------
async function createClassroom(name, section, teacherId) {
  // Validate: name and teacherId are required
  if (!name || !teacherId) {
    return {
      success: false,
      message: "Classroom name and teacher ID are required.",
      data: null,
    };
  }

  const classroom = await classroomRepository.createClassroom(name, section, teacherId);

  return {
    success: true,
    message: "Classroom created successfully.",
    data: classroom,
  };
}

// -----------------------------------------------
// Get all classrooms
// -----------------------------------------------
async function getAllClassrooms() {
  const classrooms = await classroomRepository.findAllClassrooms();

  return {
    success: true,
    message: "Classrooms retrieved successfully.",
    data: classrooms,
  };
}

// -----------------------------------------------
// Get one classroom by ID
// -----------------------------------------------
async function getClassroomById(id) {
  const classroom = await classroomRepository.findClassroomById(id);

  if (!classroom) {
    return {
      success: false,
      message: "Classroom not found.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Classroom retrieved successfully.",
    data: classroom,
  };
}

// -----------------------------------------------
// Get classrooms for a specific teacher
// -----------------------------------------------
async function getClassroomsByTeacherId(teacherId) {
  const classrooms = await classroomRepository.findClassroomsByTeacherId(teacherId);

  return {
    success: true,
    message: "Teacher's classrooms retrieved successfully.",
    data: classrooms,
  };
}

module.exports = {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacherId,
};
