import { useState } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function AttendancePage() {
  const [classroomId, setClassroomId] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

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
        <h1>Attendance</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="number"
            placeholder="Classroom ID"
            value={classroomId}
            onChange={function (e) { setClassroomId(e.target.value); }}
            required
          />
          <input
            type="date"
            value={date}
            onChange={function (e) { setDate(e.target.value); }}
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
