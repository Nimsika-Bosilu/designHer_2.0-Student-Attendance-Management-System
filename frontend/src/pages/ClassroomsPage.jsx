import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function fetchClassrooms() {
      try {
        const response = await apiClient.get("/classrooms");
        setClassrooms(response.data.data);
      } catch (err) {
        console.error("Failed to fetch classrooms:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClassrooms();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "50px" }}>Loading classrooms...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>Classrooms ({classrooms.length})</h1>

        {classrooms.length === 0 ? (
          <p>No classrooms found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Section</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map(function (classroom) {
                return (
                  <tr key={classroom.id}>
                    <td>{classroom.id}</td>
                    <td>{classroom.name}</td>
                    <td>{classroom.section || "—"}</td>
                    <td>{classroom.teacher ? classroom.teacher.name : "—"}</td>
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

export default ClassroomsPage;
