// ==============================================
// Student Repository — Database Operations
// ==============================================
// This file handles all database queries for
// students. It ONLY talks to the database.
// ==============================================

const prisma = require("../config/db");

// -----------------------------------------------
// Create a new student
// -----------------------------------------------
async function createStudent(name, email, registrationNumber, classroomId) {
  const student = await prisma.student.create({
    data: {
      name: name,
      email: email,
      registrationNumber: registrationNumber,
      classroomId: classroomId,
    },
  });
  return student;
}

// -----------------------------------------------
// Get all students (with classroom info)
// -----------------------------------------------
async function findAllStudents() {
  const students = await prisma.student.findMany({
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
    },
  });
  return students;
}

// -----------------------------------------------
// Get one student by ID
// -----------------------------------------------
async function findStudentById(id) {
  const student = await prisma.student.findUnique({
    where: {
      id: id,
    },
    include: {
      classroom: true,
    },
  });
  return student;
}

// -----------------------------------------------
// Get all students in a specific classroom
// -----------------------------------------------
async function findStudentsByClassroomId(classroomId) {
  const students = await prisma.student.findMany({
    where: {
      classroomId: classroomId,
    },
  });
  return students;
}

module.exports = {
  createStudent,
  findAllStudents,
  findStudentById,
  findStudentsByClassroomId,
};
