import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If there IS a token, show the actual page
  return children;
}

export default ProtectedRoute;
