import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function fetchStudents() {
      try {
        const response = await apiClient.get("/students");
        setStudents(response.data.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "50px" }}>Loading students...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>Students ({students.length})</h1>

        {students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Reg. Number</th>
                <th>Classroom</th>
              </tr>
            </thead>
            <tbody>
              {students.map(function (student) {
                return (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.registrationNumber}</td>
                    <td>{student.classroom ? student.classroom.name : "—"}</td>
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

export default StudentsPage;
