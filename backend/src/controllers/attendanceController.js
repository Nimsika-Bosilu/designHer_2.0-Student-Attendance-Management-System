// ==============================================
// Attendance Controller — Handles HTTP for Attendance
// ==============================================

const attendanceService = require("../services/attendanceService");

// -----------------------------------------------
// POST /api/attendance
// Mark attendance for one student
// -----------------------------------------------
async function markAttendance(req, res) {
  try {
    const studentId = req.body.studentId;
    const classroomId = req.body.classroomId;
    const date = req.body.date;
    const status = req.body.status;

    // req.user is set by the auth middleware
    // It contains the logged-in teacher's info
    const markedBy = req.user.userId;

    const result = await attendanceService.markAttendance(
      studentId,
      classroomId,
      date,
      status,
      markedBy
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// POST /api/attendance/bulk
// Mark attendance for multiple students at once
// -----------------------------------------------
async function markBulkAttendance(req, res) {
  try {
    const attendanceList = req.body.attendanceList;
    const markedBy = req.user.userId;

    const result = await attendanceService.markBulkAttendance(attendanceList, markedBy);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/attendance/classroom/:classroomId?date=2026-04-28
// Get attendance for a classroom on a specific date
// -----------------------------------------------
async function getAttendanceByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const date = req.query.date; // Get the date from the URL query string

    const result = await attendanceService.getAttendanceByClassroomAndDate(
      classroomId,
      date
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// -----------------------------------------------
// GET /api/attendance/student/:studentId
// Get attendance history for a student
// -----------------------------------------------
async function getAttendanceByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await attendanceService.getAttendanceByStudentId(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

module.exports = {
  markAttendance,
  markBulkAttendance,
  getAttendanceByClassroom,
  getAttendanceByStudent,
};
