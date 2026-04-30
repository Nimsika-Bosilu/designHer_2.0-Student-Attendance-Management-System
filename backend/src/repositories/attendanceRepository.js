// ==============================================
// Attendance Repository — Database Operations
// ==============================================
// This file handles all database queries for
// attendance records. It ONLY talks to the database.
// ==============================================

import prisma from "../config/db.js";

// -----------------------------------------------
// Mark attendance for ONE student
// -----------------------------------------------
async function createAttendance(studentId, classroomId, date, status, markedBy) {
  const record = await prisma.attendance.create({
    data: {
      studentId: studentId,
      classroomId: classroomId,
      date: new Date(date), // Convert the date string to a Date object
      status: status,
      markedBy: markedBy,
    },
  });
  return record;
}

// -----------------------------------------------
// Get attendance records for a specific classroom and date
// -----------------------------------------------
async function findAttendanceByClassroomAndDate(classroomId, date) {
  const records = await prisma.attendance.findMany({
    where: {
      classroomId: classroomId,
      date: new Date(date),
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          registrationNumber: true,
        },
      },
    },
  });
  return records;
}

// -----------------------------------------------
// Get attendance records for a specific student
// -----------------------------------------------
async function findAttendanceByStudentId(studentId) {
  const records = await prisma.attendance.findMany({
    where: {
      studentId: studentId,
    },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
  return records;
}

// -----------------------------------------------
// Check if attendance already exists for a student on a date
// -----------------------------------------------
async function findExistingAttendance(studentId, date) {
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId: studentId,
      date: new Date(date),
    },
  });
  return existing;
}

export {
  createAttendance,
  findAttendanceByClassroomAndDate,
  findAttendanceByStudentId,
  findExistingAttendance,
};
