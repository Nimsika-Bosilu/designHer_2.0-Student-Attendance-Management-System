// ==============================================
// Attendance Service — Business Logic
// ==============================================
// This file handles the LOGIC for attendance.
// It validates data and checks for duplicates
// before saving to the database.
// ==============================================

const attendanceRepository = require("../repositories/attendanceRepository");

// -----------------------------------------------
// Mark attendance for one student
// -----------------------------------------------
async function markAttendance(studentId, classroomId, date, status, markedBy) {
  // Validate: all fields are required
  if (!studentId || !classroomId || !date || !status || !markedBy) {
    return {
      success: false,
      message: "All fields are required: studentId, classroomId, date, status.",
      data: null,
    };
  }

  // Validate: status must be one of the allowed values
  const allowedStatuses = ["present", "absent", "late"];
  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      message: "Status must be 'present', 'absent', or 'late'.",
      data: null,
    };
  }

  // Check if attendance already exists for this student on this date
  const existing = await attendanceRepository.findExistingAttendance(studentId, date);
  if (existing) {
    return {
      success: false,
      message: "Attendance already marked for this student on this date.",
      data: null,
    };
  }

  // Save the attendance record
  const record = await attendanceRepository.createAttendance(
    studentId,
    classroomId,
    date,
    status,
    markedBy
  );

  return {
    success: true,
    message: "Attendance marked successfully.",
    data: record,
  };
}

// -----------------------------------------------
// Mark attendance for multiple students at once (bulk)
// -----------------------------------------------
async function markBulkAttendance(attendanceList, markedBy) {
  // attendanceList is an array like:
  // [{ studentId: 1, classroomId: 1, date: "2026-04-28", status: "present" }, ...]

  if (!attendanceList || attendanceList.length === 0) {
    return {
      success: false,
      message: "Attendance list cannot be empty.",
      data: null,
    };
  }

  const results = [];
  const errors = [];

  // Loop through each student's attendance
  for (let i = 0; i < attendanceList.length; i++) {
    const item = attendanceList[i];

    const result = await markAttendance(
      item.studentId,
      item.classroomId,
      item.date,
      item.status,
      markedBy
    );

    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        studentId: item.studentId,
        error: result.message,
      });
    }
  }

  return {
    success: true,
    message: `Attendance processed. ${results.length} saved, ${errors.length} errors.`,
    data: {
      saved: results,
      errors: errors,
    },
  };
}

// -----------------------------------------------
// Get attendance for a classroom on a specific date
// -----------------------------------------------
async function getAttendanceByClassroomAndDate(classroomId, date) {
  if (!classroomId || !date) {
    return {
      success: false,
      message: "Classroom ID and date are required.",
      data: null,
    };
  }

  const records = await attendanceRepository.findAttendanceByClassroomAndDate(
    classroomId,
    date
  );

  return {
    success: true,
    message: "Attendance records retrieved successfully.",
    data: records,
  };
}

// -----------------------------------------------
// Get attendance history for a student
// -----------------------------------------------
async function getAttendanceByStudentId(studentId) {
  const records = await attendanceRepository.findAttendanceByStudentId(studentId);

  return {
    success: true,
    message: "Student attendance history retrieved successfully.",
    data: records,
  };
}

module.exports = {
  markAttendance,
  markBulkAttendance,
  getAttendanceByClassroomAndDate,
  getAttendanceByStudentId,
};
