import { Link, useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/classrooms", label: "Classrooms", icon: "🏫" },
  { to: "/students", label: "Students", icon: "👩‍🎓" },
  { to: "/mark-attendance", label: "Mark Attendance", icon: "✅" },
  { to: "/attendance", label: "View Attendance", icon: "📋" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user && user.role === "admin";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-indigo-600 font-bold text-lg tracking-tight">designHer 2.0</p>
        <p className="text-gray-400 text-xs mt-0.5">Attendance System</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map(function (link) {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        {/* Admin-only link */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 mt-2 ${
              location.pathname === "/admin"
                ? "bg-violet-50 text-violet-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="text-base">⚙️</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user ? user.name : "User"}</p>
          <span className={`text-xs font-medium ${isAdmin ? "text-violet-600" : "text-blue-600"}`}>
            {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-500 hover:text-red-500 transition-colors duration-150 py-1"
        >
          → Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
