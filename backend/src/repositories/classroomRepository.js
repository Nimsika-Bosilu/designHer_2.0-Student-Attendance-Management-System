// ==============================================
// Classroom Repository — Database Operations
// ==============================================
// This file handles all database queries for
// classrooms. It ONLY talks to the database.
// ==============================================

const prisma = require("../config/db");

// -----------------------------------------------
// Create a new classroom
// -----------------------------------------------
async function createClassroom(name, section, teacherId) {
  const classroom = await prisma.classroom.create({
    data: {
      name: name,
      section: section,
      teacherId: teacherId,
    },
  });
  return classroom;
}

// -----------------------------------------------
// Get all classrooms (with teacher name)
// -----------------------------------------------
async function findAllClassrooms() {
  const classrooms = await prisma.classroom.findMany({
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return classrooms;
}

// -----------------------------------------------
// Get one classroom by its ID
// -----------------------------------------------
async function findClassroomById(id) {
  const classroom = await prisma.classroom.findUnique({
    where: {
      id: id,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      students: true,
    },
  });
  return classroom;
}

// -----------------------------------------------
// Get classrooms assigned to a specific teacher
// -----------------------------------------------
async function findClassroomsByTeacherId(teacherId) {
  const classrooms = await prisma.classroom.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      students: true,
    },
  });
  return classrooms;
}

module.exports = {
  createClassroom,
  findAllClassrooms,
  findClassroomById,
  findClassroomsByTeacherId,
};
