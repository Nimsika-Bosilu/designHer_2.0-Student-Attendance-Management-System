import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">designHer 2.0</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/classrooms">Classrooms</Link>
        <Link to="/students">Students</Link>
        <Link to="/attendance">Attendance</Link>
      </div>
      <div className="navbar-user">
        <span>{user ? user.name : "User"} ({user ? user.role : ""})</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
