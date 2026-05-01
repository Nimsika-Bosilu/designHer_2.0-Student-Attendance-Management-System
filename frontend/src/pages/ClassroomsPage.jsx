import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";

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
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="page-header">Classrooms</h1>
        <p className="page-subheader">{classrooms.length} classroom{classrooms.length !== 1 ? "s" : ""} registered</p>
      </div>

      {classrooms.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-gray-500 text-sm">No classrooms found. Ask the admin to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classrooms.map(function (classroom) {
                return (
                  <tr key={classroom.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">#{classroom.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{classroom.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{classroom.section || "—"}</td>
                    <td className="px-5 py-3.5">
                      {classroom.teacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                            {classroom.teacher.name.charAt(0)}
                          </div>
                          <span className="text-gray-700">{classroom.teacher.name}</span>
                        </div>
                      ) : "—"}
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

export default ClassroomsPage;
