import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClassroomsPage from "./pages/ClassroomsPage";
import StudentsPage from "./pages/StudentsPage";
import AttendancePage from "./pages/AttendancePage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — anyone can access */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — must be logged in */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/classrooms" element={
          <ProtectedRoute><ClassroomsPage /></ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute><StudentsPage /></ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute><AttendancePage /></ProtectedRoute>
        } />

        {/* Catch-all — redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
