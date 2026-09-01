import React, { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Bugs from "./pages/Bugs";
import CreateBug from "./pages/CreateBug";
import BugDetails from "./pages/BugDetails";
import Projects from "./pages/Projects";
import Users from "./pages/Users";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const links = [
    ["/", "Dashboard"],
    ["/bugs", "Bugs"],
    ["/bugs/new", "Create Bug"],
    ["/projects", "Projects"],
    ...(user?.role === "admin" ? [["/users", "Users"]] : []),
  ];

  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">🐞 BugTrack</div>
        <nav>
          {links.map(([to, label]) => (
            <Link
              key={to}
              className={location.pathname === to ? "active" : ""}
              onClick={() => setOpen(false)}
              to={to}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="ghost" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main">
        <button className="menu-btn" onClick={() => setOpen(!open)}>
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="*"
        element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bugs" element={<Bugs />} />
                <Route path="/bugs/new" element={<CreateBug />} />
                <Route path="/bugs/:id" element={<BugDetails />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/users" element={<Users />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}

