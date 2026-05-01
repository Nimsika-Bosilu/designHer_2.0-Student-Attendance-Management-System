import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";

const STATUS_OPTIONS = ["present", "absent", "late"];
const STATUS_COLORS = {
  present: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  absent:  "bg-red-100 text-red-700 ring-red-200",
  late:    "bg-amber-100 text-amber-700 ring-amber-200",
};

function MarkAttendancePage() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Default date to today
  useEffect(function () {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  useEffect(function () {
    async function loadClassrooms() {
      try {
        const response = await apiClient.get("/classrooms");
        setClassrooms(response.data.data);
      } catch (err) {
        console.error("Failed to load classrooms", err);
      }
    }
    loadClassrooms();
  }, []);

  async function handleLoadStudents(event) {
    event.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    setStudents([]);

    try {
      const response = await apiClient.get("/students/classroom/" + selectedClassroomId);
      const list = response.data.data;
      setStudents(list);

      const initial = {};
      list.forEach(function (s) { initial[s.id] = "present"; });
      setAttendanceData(initial);

      if (list.length === 0) {
        setMessage({ text: "No students found in this classroom.", type: "info" });
      }
    } catch (err) {
      setMessage({ text: "Failed to load students.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(studentId, status) {
    setAttendanceData(function (prev) { return { ...prev, [studentId]: status }; });
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage({ text: "", type: "" });

    const records = Object.keys(attendanceData).map(function (id) {
      return {
        studentId: parseInt(id),
        classroomId: parseInt(selectedClassroomId),
        date: date,
        status: attendanceData[id],
      };
    });

    try {
      const response = await apiClient.post("/attendance/bulk", { attendanceList: records });
      const errors = response.data.data ? response.data.data.errors : [];
      if (errors && errors.length > 0) {
        setMessage({ text: "⚠️ " + response.data.message, type: "warn" });
      } else {
        setMessage({ text: "Attendance submitted successfully!", type: "success" });
        setStudents([]);
      }
    } catch (err) {
      const msg = err.response && err.response.data ? err.response.data.message : "Failed to submit attendance.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const msgClasses = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
    error: "bg-red-50 border-red-100 text-red-700",
    warn: "bg-amber-50 border-amber-100 text-amber-700",
    info: "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="page-header">Mark Attendance</h1>
        <p className="page-subheader">Select a classroom and date, then set each student's status.</p>
      </div>

      {/* Filter form */}
      <div className="card mb-6">
        <form onSubmit={handleLoadStudents} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Classroom</label>
            <select
              id="classroom-select"
              value={selectedClassroomId}
              onChange={function (e) { setSelectedClassroomId(e.target.value); }}
              required
              className="input-field"
            >
              <option value="">Select classroom...</option>
              {classrooms.map(function (c) {
                return <option key={c.id} value={c.id}>{c.name}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={function (e) { setDate(e.target.value); }}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedClassroomId || !date}
            className="btn-primary px-6 py-2.5"
          >
            {loading && students.length === 0 ? "Loading..." : "Load Students"}
          </button>
        </form>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`border rounded-lg px-4 py-3 mb-5 text-sm font-medium ${msgClasses[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Student attendance table */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{students.length} students · {date}</p>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Absent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Late</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg. Number</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(function (student) {
                const current = attendanceData[student.id] || "present";
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{student.registrationNumber}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map(function (s) {
                          const active = current === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={function () { handleStatusChange(student.id, s); }}
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ring-1 transition-all duration-100 ${
                                active
                                  ? STATUS_COLORS[s] + " ring-current"
                                  : "bg-gray-50 text-gray-400 ring-gray-200 hover:ring-gray-300"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
            <button
              id="submit-attendance-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-8 py-2.5"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default MarkAttendancePage;
