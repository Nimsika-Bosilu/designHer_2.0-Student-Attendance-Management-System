// ==============================================
// Student Repository — Database Operations
// ==============================================
// This file handles all database queries for
// students. It ONLY talks to the database.
// ==============================================

import prisma from "../config/db.js";

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

// -----------------------------------------------
// Get all students for a specific teacher
// -----------------------------------------------
async function findStudentsByTeacherId(teacherId) {
  const students = await prisma.student.findMany({
    where: {
      classroom: {
        teacherId: teacherId,
      },
    },
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

export {
  createStudent,
  findAllStudents,
  findStudentById,
  findStudentsByClassroomId,
  findStudentsByTeacherId,
};
