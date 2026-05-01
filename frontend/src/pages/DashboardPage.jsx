import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";

function DashboardPage() {
  const [stats, setStats] = useState({ classrooms: 0, students: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user && user.role === "admin";

  useEffect(function () {
    async function fetchStats() {
      try {
        const calls = [apiClient.get("/classrooms"), apiClient.get("/students")];
        if (isAdmin) calls.push(apiClient.get("/auth/users"));

        const results = await Promise.all(calls);
        setStats({
          classrooms: results[0].data.data.length,
          students: results[1].data.data.length,
          teachers: isAdmin ? results[2].data.data.filter(function (u) { return u.role === "teacher"; }).length : null,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Classrooms", value: stats.classrooms, icon: "🏫", to: "/classrooms", color: "indigo" },
    { label: "Total Students", value: stats.students, icon: "👩‍🎓", to: "/students", color: "emerald" },
    ...(isAdmin ? [{ label: "Teachers", value: stats.teachers, icon: "👤", to: "/admin", color: "violet" }] : []),
  ];

  const quickLinks = [
    { label: "Mark Today's Attendance", to: "/mark-attendance", desc: "Record attendance for a classroom", icon: "✅" },
    { label: "View Attendance Report", to: "/attendance", desc: "Check attendance by date & class", icon: "📋" },
    { label: "Manage Classrooms", to: "/classrooms", desc: "See all classrooms", icon: "🏫" },
    ...(isAdmin ? [{ label: "Admin Panel", to: "/admin", desc: "Add teachers & classrooms", icon: "⚙️" }] : []),
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-header">Welcome back, {user ? user.name.split(" ")[0] : "User"} 👋</h1>
        <p className="page-subheader">
          Here's what's happening with your attendance system today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(function (s) {
          return (
            <Link key={s.label} to={s.to} className="card hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium text-gray-400 group-hover:text-indigo-500 transition-colors">View →</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{s.value ?? "—"}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(function (q) {
            return (
              <Link
                key={q.label}
                to={q.to}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-lg flex-shrink-0">
                  {q.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">{q.label}</p>
                  <p className="text-xs text-gray-400">{q.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
