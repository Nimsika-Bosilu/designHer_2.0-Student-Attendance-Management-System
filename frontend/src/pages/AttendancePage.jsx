import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function AttendancePage() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load classrooms for the dropdown
  useEffect(function () {
    async function loadClassrooms() {
      try {
        const response = await apiClient.get("/classrooms");
        setClassrooms(response.data.data);
      } catch (err) {}
    }
    loadClassrooms();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setRecords([]);

    try {
      const response = await apiClient.get(
        "/attendance/classroom/" + classroomId + "?date=" + date
      );
      setRecords(response.data.data);

      if (response.data.data.length === 0) {
        setMessage("No attendance records found for this date.");
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Failed to fetch attendance records.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>View Attendance</h1>

        <form onSubmit={handleSearch} className="search-form">
          <select 
            value={classroomId} 
            onChange={function(e) { setClassroomId(e.target.value); }}
            required
          >
            <option value="">-- Select Classroom --</option>
            {classrooms.map(function(c) {
              return <option key={c.id} value={c.id}>{c.name}</option>;
            })}
          </select>

          <input
            type="date"
            value={date}
            onChange={function(e) { setDate(e.target.value); }}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {message && <p style={{ marginTop: "15px", color: "#888" }}>{message}</p>}

        {records.length > 0 && (
          <table style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Reg. Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(function (record) {
                return (
                  <tr key={record.id}>
                    <td>{record.student ? record.student.name : "—"}</td>
                    <td>{record.student ? record.student.registrationNumber : "—"}</td>
                    <td>
                      <span className={"status-badge status-" + record.status}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AttendancePage;
