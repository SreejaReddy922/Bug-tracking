import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"tester" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const data = await api.register(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (e) { setError(e.message); }
  }

  return <div className="auth-page"><div className="auth-card">
    <div className="auth-logo">🐞</div><h1>Create account</h1><p className="muted">Join your development team.</p>
    <form onSubmit={submit} className="form">
      {error && <div className="error">{error}</div>}
      <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="6" required /></label>
      <label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="tester">Tester</option><option value="developer">Developer</option></select></label>
      <button className="primary">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  </div></div>;
}