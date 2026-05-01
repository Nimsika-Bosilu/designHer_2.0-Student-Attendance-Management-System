import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";

function AttendancePage() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(function () {
    async function loadClassrooms() {
      try {
        const response = await apiClient.get("/classrooms");
        setClassrooms(response.data.data);
      } catch (err) {}
    }
    loadClassrooms();

    // Default date to today
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setRecords([]);
    setSearched(true);

    try {
      const response = await apiClient.get("/attendance/classroom/" + classroomId + "?date=" + date);
      setRecords(response.data.data);
      if (response.data.data.length === 0) {
        setMessage("No attendance records found for this date.");
      }
    } catch (err) {
      const msg = err.response && err.response.data ? err.response.data.message : "Failed to fetch attendance records.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = { present: "badge-present", absent: "badge-absent", late: "badge-late" };

  const summary = {
    present: records.filter(function (r) { return r.status === "present"; }).length,
    absent:  records.filter(function (r) { return r.status === "absent"; }).length,
    late:    records.filter(function (r) { return r.status === "late"; }).length,
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="page-header">View Attendance</h1>
        <p className="page-subheader">Search attendance records by classroom and date.</p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Classroom</label>
            <select
              id="view-classroom-select"
              value={classroomId}
              onChange={function (e) { setClassroomId(e.target.value); }}
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
              id="view-date"
              type="date"
              value={date}
              onChange={function (e) { setDate(e.target.value); }}
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Summary pills */}
      {records.length > 0 && (
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">{summary.present} Present</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-700">{summary.absent} Absent</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-700">{summary.late} Late</span>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500 mb-5">
          {message}
        </div>
      )}

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg. Number</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(function (record) {
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {record.student ? record.student.name.charAt(0) : "?"}
                        </div>
                        <span className="font-medium text-gray-900">{record.student ? record.student.name : "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                      {record.student ? record.student.registrationNumber : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={statusBadge[record.status] || "badge-absent"}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default AttendancePage;
