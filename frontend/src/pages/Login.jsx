import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "admin@example.com", password: "Admin@123" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const data = await api.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (e) { setError(e.message); }
  }

  return <AuthLayout title="Welcome back" subtitle="Sign in to manage your bugs.">
    <form onSubmit={submit} className="form">
      {error && <div className="error">{error}</div>}
      <label>Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required /></label>
      <label>Password<input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required /></label>
      <button className="primary">Login</button>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </form>
  </AuthLayout>;
}

function AuthLayout({ title, subtitle, children }) {
  return <div className="auth-page"><div className="auth-card">
    <div className="auth-logo">🐞</div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}
  </div></div>;
}