// ==============================================
// Classroom Service — Business Logic
// ==============================================
// This file handles the LOGIC for classrooms.
// It validates data and uses the repository.
// ==============================================

import * as classroomRepository from "../repositories/classroomRepository.js";

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

// -----------------------------------------------
// Update a classroom's details / reassign teacher
// -----------------------------------------------
async function updateClassroom(id, name, section, teacherId) {
  if (!id) {
    return { success: false, message: "Classroom ID is required.", data: null };
  }

  // Make sure the classroom exists first
  const existing = await classroomRepository.findClassroomById(id);
  if (!existing) {
    return { success: false, message: "Classroom not found.", data: null };
  }

  const classroom = await classroomRepository.updateClassroom(id, name, section, teacherId);
  return {
    success: true,
    message: "Classroom updated successfully.",
    data: classroom,
  };
}

export {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacherId,
  updateClassroom,
};
