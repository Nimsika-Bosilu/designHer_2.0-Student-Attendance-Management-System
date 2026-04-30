import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

function DashboardPage() {
  const [stats, setStats] = useState({ classrooms: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function fetchStats() {
      try {
        const [classroomRes, studentRes] = await Promise.all([
          apiClient.get("/classrooms"),
          apiClient.get("/students"),
        ]);

        setStats({
          classrooms: classroomRes.data.data.length,
          students: studentRes.data.data.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>Welcome, {user ? user.name : "User"}!</h1>
        <p>Role: <strong>{user ? user.role : ""}</strong></p>

        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.classrooms}</h2>
            <p>Classrooms</p>
          </div>
          <div className="stat-card">
            <h2>{stats.students}</h2>
            <p>Students</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
