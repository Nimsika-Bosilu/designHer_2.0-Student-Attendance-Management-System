// ==============================================
// Student Service — Business Logic
// ==============================================
// This file handles the LOGIC for students.
// It validates data and uses the repository.
// ==============================================

const studentRepository = require("../repositories/studentRepository");

// -----------------------------------------------
// Create a new student
// -----------------------------------------------
async function createStudent(name, email, registrationNumber, classroomId) {
  // Validate: all fields are required
  if (!name || !email || !registrationNumber || !classroomId) {
    return {
      success: false,
      message: "All fields are required: name, email, registrationNumber, classroomId.",
      data: null,
    };
  }

  const student = await studentRepository.createStudent(
    name,
    email,
    registrationNumber,
    classroomId
  );

  return {
    success: true,
    message: "Student created successfully.",
    data: student,
  };
}

// -----------------------------------------------
// Get all students
// -----------------------------------------------
async function getAllStudents() {
  const students = await studentRepository.findAllStudents();

  return {
    success: true,
    message: "Students retrieved successfully.",
    data: students,
  };
}

// -----------------------------------------------
// Get one student by ID
// -----------------------------------------------
async function getStudentById(id) {
  const student = await studentRepository.findStudentById(id);

  if (!student) {
    return {
      success: false,
      message: "Student not found.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Student retrieved successfully.",
    data: student,
  };
}

// -----------------------------------------------
// Get students in a classroom
// -----------------------------------------------
async function getStudentsByClassroomId(classroomId) {
  const students = await studentRepository.findStudentsByClassroomId(classroomId);

  return {
    success: true,
    message: "Students retrieved successfully.",
    data: students,
  };
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClassroomId,
};
