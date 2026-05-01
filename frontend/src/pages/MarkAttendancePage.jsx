import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function MarkAttendancePage() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  
  // This object will hold { studentId: "present" } or { studentId: "absent" }
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1: Fetch classrooms for the Dropdown when page loads
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

  // Step 2: Fetch students when they click "Load Students"
  async function handleLoadStudents(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Find students that belong to the selected classroom
      const response = await apiClient.get("/students");
      const allStudents = response.data.data;
      
      const filteredStudents = allStudents.filter(function(student) {
        return student.classroomId === parseInt(selectedClassroomId);
      });

      setStudents(filteredStudents);

      // Default everyone to 'present' initially
      const initialData = {};
      filteredStudents.forEach(function(student) {
        initialData[student.id] = "present";
      });
      setAttendanceData(initialData);

      if (filteredStudents.length === 0) {
        setMessage("No students found in this classroom.");
      }
    } catch (err) {
      setMessage("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  // Handle radio button changes for a specific student
  function handleStatusChange(studentId, status) {
    setAttendanceData(function(prevData) {
      return { ...prevData, [studentId]: status };
    });
  }

  // Step 3: Submit the bulk data to the backend
  async function handleSubmitAttendance() {
    setLoading(true);
    setMessage("");

    // Convert our object { 1: "present", 2: "absent" } into an array
    const records = Object.keys(attendanceData).map(function(studentId) {
      return {
        studentId: parseInt(studentId),
        status: attendanceData[studentId]
      };
    });

    try {
      await apiClient.post("/attendance/bulk", {
        classroomId: parseInt(selectedClassroomId),
        date: date,
        records: records
      });
      
      setMessage("✅ Attendance marked successfully!");
      setStudents([]); // Clear the table on success
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage("❌ " + err.response.data.message);
      } else {
        setMessage("❌ Failed to mark attendance.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>Mark Attendance</h1>

        <form onSubmit={handleLoadStudents} className="search-form">
          <select 
            value={selectedClassroomId} 
            onChange={function(e) { setSelectedClassroomId(e.target.value); }}
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
          <button type="submit" disabled={loading || !selectedClassroomId || !date}>
            Load Students
          </button>
        </form>

        {message && <p className={message.includes("✅") ? "success-msg" : "error"}>{message}</p>}

        {students.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg. Number</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(function(student) {
                  return (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.registrationNumber}</td>
                      <td>
                        <div className="attendance-toggle">
                          <label>
                            <input 
                              type="radio" 
                              name={"status-" + student.id} 
                              value="present"
                              checked={attendanceData[student.id] === "present"}
                              onChange={function() { handleStatusChange(student.id, "present"); }}
                            /> Present
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name={"status-" + student.id} 
                              value="absent"
                              checked={attendanceData[student.id] === "absent"}
                              onChange={function() { handleStatusChange(student.id, "absent"); }}
                            /> Absent
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name={"status-" + student.id} 
                              value="late"
                              checked={attendanceData[student.id] === "late"}
                              onChange={function() { handleStatusChange(student.id, "late"); }}
                            /> Late
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <button className="mark-btn" onClick={handleSubmitAttendance} disabled={loading}>
              {loading ? "Saving..." : "Submit Attendance"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default MarkAttendancePage;
