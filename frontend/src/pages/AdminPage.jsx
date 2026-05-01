import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";

// ── Reusable alert banner ─────────────────────────────────────
function Alert({ msg }) {
  if (!msg.text) return null;
  const styles = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
    error:   "bg-red-50 border-red-100 text-red-700",
    warn:    "bg-amber-50 border-amber-100 text-amber-700",
  };
  return (
    <div className={`border rounded-lg px-3 py-2.5 text-xs font-medium ${styles[msg.type] || styles.error}`}>
      {msg.text}
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function AdminPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Redirect non-admins immediately
  useEffect(function () {
    if (!user || user.role !== "admin") navigate("/dashboard");
  }, []);

  // ── Shared state ─────────────────────────────────────────────
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const refreshData = useCallback(async function () {
    try {
      const [usersRes, classroomsRes] = await Promise.all([
        apiClient.get("/auth/users"),
        apiClient.get("/classrooms"),
      ]);
      const allUsers = usersRes.data.data;
      setTeachers(allUsers.filter(function (u) { return u.role === "teacher"; }));
      setClassrooms(classroomsRes.data.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(function () { refreshData(); }, []);

  // ── Add Teacher ──────────────────────────────────────────────
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", password: "" });
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState({ text: "", type: "" });

  async function handleAddTeacher(e) {
    e.preventDefault();
    setTeacherLoading(true);
    setTeacherMsg({ text: "", type: "" });
    try {
      await apiClient.post("/auth/register", { ...teacherForm, role: "teacher" });
      setTeacherMsg({ text: "Teacher account created successfully!", type: "success" });
      setTeacherForm({ name: "", email: "", password: "" });
      refreshData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create teacher.";
      setTeacherMsg({ text: msg, type: "error" });
    } finally {
      setTeacherLoading(false);
    }
  }

  // ── Add Classroom ─────────────────────────────────────────────
  const [classroomForm, setClassroomForm] = useState({ name: "", section: "", teacherId: "" });
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomMsg, setClassroomMsg] = useState({ text: "", type: "" });

  async function handleAddClassroom(e) {
    e.preventDefault();
    setClassroomLoading(true);
    setClassroomMsg({ text: "", type: "" });
    try {
      await apiClient.post("/classrooms", {
        name: classroomForm.name,
        section: classroomForm.section,
        teacherId: parseInt(classroomForm.teacherId),
      });
      setClassroomMsg({ text: "Classroom created and linked to teacher!", type: "success" });
      setClassroomForm({ name: "", section: "", teacherId: "" });
      refreshData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create classroom.";
      setClassroomMsg({ text: msg, type: "error" });
    } finally {
      setClassroomLoading(false);
    }
  }

  // ── Reassign Teacher ──────────────────────────────────────────
  const [reassignForm, setReassignForm] = useState({ classroomId: "", newTeacherId: "" });
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignMsg, setReassignMsg] = useState({ text: "", type: "" });

  // Derive what the current teacher is for the selected classroom
  const selectedClassroom = classrooms.find(function (c) {
    return String(c.id) === String(reassignForm.classroomId);
  });

  async function handleReassign(e) {
    e.preventDefault();
    if (!reassignForm.classroomId || !reassignForm.newTeacherId) return;
    setReassignLoading(true);
    setReassignMsg({ text: "", type: "" });
    try {
      await apiClient.put("/classrooms/" + reassignForm.classroomId, {
        teacherId: parseInt(reassignForm.newTeacherId),
      });
      setReassignMsg({ text: "Teacher reassigned successfully!", type: "success" });
      setReassignForm({ classroomId: "", newTeacherId: "" });
      refreshData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reassign teacher.";
      setReassignMsg({ text: msg, type: "error" });
    } finally {
      setReassignLoading(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function upd(setter, field, val) {
    setter(function (p) { return { ...p, [field]: val }; });
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-header">Admin Panel</h1>
        <p className="page-subheader">Manage teachers, classrooms, and assignments.</p>
      </div>

      {/* ── Row 1: Add Teacher + Add Classroom ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Add Teacher */}
        <SectionCard icon="👤" title="Add Teacher Account" subtitle="Creates a login for a new teacher">
          <form id="add-teacher-form" onSubmit={handleAddTeacher} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input id="teacher-name" type="text" placeholder="e.g. Kasun Perera"
                value={teacherForm.name} onChange={function (e) { upd(setTeacherForm, "name", e.target.value); }}
                required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
              <input id="teacher-email" type="email" placeholder="kasun@school.com"
                value={teacherForm.email} onChange={function (e) { upd(setTeacherForm, "email", e.target.value); }}
                required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input id="teacher-password" type="password" placeholder="Minimum 6 characters"
                value={teacherForm.password} onChange={function (e) { upd(setTeacherForm, "password", e.target.value); }}
                required minLength={6} className="input-field" />
            </div>
            <Alert msg={teacherMsg} />
            <button id="add-teacher-btn" type="submit" disabled={teacherLoading} className="btn-primary w-full py-2.5">
              {teacherLoading ? "Creating..." : "Create Teacher Account"}
            </button>
          </form>
        </SectionCard>

        {/* Add Classroom */}
        <SectionCard icon="🏫" title="Add Classroom" subtitle="Creates a classroom and links it to a teacher">
          <form id="add-classroom-form" onSubmit={handleAddClassroom} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Classroom Name</label>
              <input id="classroom-name" type="text" placeholder="e.g. Batch 2026 - Web Dev"
                value={classroomForm.name} onChange={function (e) { upd(setClassroomForm, "name", e.target.value); }}
                required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Section <span className="text-gray-400">(optional)</span>
              </label>
              <input id="classroom-section" type="text" placeholder="e.g. Morning / Evening"
                value={classroomForm.section} onChange={function (e) { upd(setClassroomForm, "section", e.target.value); }}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assign Teacher</label>
              {teachers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                  No teachers yet — add one first using the form on the left.
                </div>
              ) : (
                <select id="classroom-teacher" value={classroomForm.teacherId}
                  onChange={function (e) { upd(setClassroomForm, "teacherId", e.target.value); }}
                  required className="input-field">
                  <option value="">Select teacher...</option>
                  {teachers.map(function (t) {
                    return <option key={t.id} value={t.id}>{t.name} — {t.email}</option>;
                  })}
                </select>
              )}
            </div>
            <Alert msg={classroomMsg} />
            <button id="add-classroom-btn" type="submit" disabled={classroomLoading || teachers.length === 0}
              className="btn-primary w-full py-2.5">
              {classroomLoading ? "Creating..." : "Create Classroom"}
            </button>
          </form>
        </SectionCard>
      </div>

      {/* ── Row 2: Reassign Teacher ── */}
      <div className="mb-6">
        <SectionCard icon="🔄" title="Change Classroom Teacher" subtitle="Reassign a classroom to a different teacher">
          <form id="reassign-form" onSubmit={handleReassign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: pick classroom */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mr-1">1</span>
                  Select Classroom
                </label>
                <select id="reassign-classroom" value={reassignForm.classroomId}
                  onChange={function (e) { upd(setReassignForm, "classroomId", e.target.value); upd(setReassignForm, "newTeacherId", ""); }}
                  required className="input-field">
                  <option value="">Select classroom...</option>
                  {classrooms.map(function (c) {
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.section ? "(" + c.section + ")" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Show current teacher */}
                {selectedClassroom && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500">Current teacher:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                        {selectedClassroom.teacher ? selectedClassroom.teacher.name.charAt(0) : "?"}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {selectedClassroom.teacher ? selectedClassroom.teacher.name : "Unassigned"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: pick new teacher */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mr-1">2</span>
                  Select New Teacher
                </label>
                <select id="reassign-teacher" value={reassignForm.newTeacherId}
                  onChange={function (e) { upd(setReassignForm, "newTeacherId", e.target.value); }}
                  required disabled={!reassignForm.classroomId}
                  className="input-field disabled:opacity-50">
                  <option value="">Select teacher...</option>
                  {teachers.map(function (t) {
                    const isCurrent = selectedClassroom && selectedClassroom.teacher && selectedClassroom.teacher.id === t.id;
                    return (
                      <option key={t.id} value={t.id} disabled={isCurrent}>
                        {t.name}{isCurrent ? " (current)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <Alert msg={reassignMsg} />

            <div className="flex items-center gap-3">
              <button id="reassign-btn" type="submit"
                disabled={reassignLoading || !reassignForm.classroomId || !reassignForm.newTeacherId}
                className="btn-primary px-8 py-2.5">
                {reassignLoading ? "Saving..." : "Save New Assignment"}
              </button>
              {reassignForm.classroomId && reassignForm.newTeacherId && (
                <p className="text-xs text-gray-400">
                  Assigning <strong className="text-gray-600">
                    {teachers.find(function (t) { return String(t.id) === String(reassignForm.newTeacherId); })?.name}
                  </strong> to <strong className="text-gray-600">
                    {selectedClassroom?.name}
                  </strong>
                </p>
              )}
            </div>
          </form>
        </SectionCard>
      </div>

      {/* ── Row 3: Current Teachers + Classrooms overview ── */}
      {!dataLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Teachers ({teachers.length})
            </h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {teachers.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No teachers yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {teachers.map(function (t) {
                    const assigned = classrooms.filter(function (c) {
                      return c.teacher && c.teacher.id === t.id;
                    });
                    return (
                      <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                          <p className="text-xs text-gray-400 truncate">{t.email}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {assigned.length} class{assigned.length !== 1 ? "es" : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Classrooms ({classrooms.length})
            </h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {classrooms.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No classrooms yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {classrooms.map(function (c) {
                    return (
                      <li key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm flex-shrink-0">🏫</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.section ? c.section + " · " : ""}
                            {c.teacher ? c.teacher.name : "No teacher assigned"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminPage;
