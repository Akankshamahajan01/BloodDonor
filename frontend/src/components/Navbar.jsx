import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isLoggedIn, logout, getInitials } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-drop">▼</span>
        Blood<span className="logo-red">Connect</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/donor" className={({ isActive }) => isActive ? "active" : ""}>Donate Blood</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>Search Donors</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>About Us</NavLink>
      </nav>

      <div id="navbarAuth">
        {!isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link to="/login" className="navbar-login">Login</Link>
            <Link to="/register" className="navbar-register">
              Register <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="profile-button"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <span className="profile-avatar">{getInitials(user.name)}</span>
              <span className="profile-name">{user.name.split(" ")[0]}</span>
              <span className="profile-arrow">▾</span>
            </button>

            <div className={`profile-dropdown${dropdownOpen ? " show" : ""}`}>
              <div className="profile-dropdown-header">
                <div className="dropdown-avatar">{getInitials(user.name)}</div>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/dashboard" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                <span>→</span> My Dashboard
              </Link>
              <button type="button" className="dropdown-logout" onClick={handleLogout}>
                <span>↪</span> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
